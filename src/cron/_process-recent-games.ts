// This example demonstrates a NodeJS 8.10 async handler[1], however of course you could use
// the more traditional callback-style handler.

import { getConnection, logBeforeTimeout } from '@firestone-hs/aws-lambda-utils';
import { Context } from 'aws-lambda';
import { GlobalOpenSkill } from '../model';
import { getUsersInCommunities, updateCommunities } from './internal/communities';
import { retrieveGlobalOpenSkill } from './internal/open-skill';
import { getLatestProcessedId, updateLastProcessedId } from './internal/process-tracking';
import { getRecentGames } from './internal/replay-summary';

// [1]: https://aws.amazon.com/blogs/compute/node-js-8-10-runtime-now-available-in-aws-lambda/
export default async (event, context: Context): Promise<any> => {
	const cleanup = logBeforeTimeout(context);

	const mysql = await getConnection();
	const lastProcessedId = await getLatestProcessedId(mysql);
	console.log('processing recent games', lastProcessedId);
	if (!lastProcessedId) {
		await mysql.end();
		throw new Error('Could not retrieve last processed id');
	}

	const communityInfos = await getUsersInCommunities(mysql);
	const globalOpenSkill: GlobalOpenSkill = await retrieveGlobalOpenSkill();
	// console.log('got users', communityInfos?.length, communityInfos);
	const { games, newLastProcessedId } = await getRecentGames(mysql, lastProcessedId, communityInfos);
	// console.log('got games', games?.length, newLastProcessedId);
	await updateCommunities(games, communityInfos, globalOpenSkill);
	// TODO: add another process for global skill updates?
	// await updateGlobalOpenSkill(globalOpenSkill);
	// console.log('updated communities');
	await updateLastProcessedId(mysql, newLastProcessedId);
	console.log('updated last processed id');
	await mysql.end();

	cleanup();

	return { statusCode: 200, body: null };
};
