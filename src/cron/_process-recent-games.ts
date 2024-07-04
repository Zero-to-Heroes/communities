// This example demonstrates a NodeJS 8.10 async handler[1], however of course you could use
// the more traditional callback-style handler.

import { logBeforeTimeout } from '@firestone-hs/aws-lambda-utils';
import { Context } from 'aws-lambda';
import { getUsersInCommunities, updateCommunities } from './internal/communities';
import { getLatestProcessedId, updateLastProcessedId } from './internal/process-tracking';
import { getRecentGames } from './internal/replay-summary';

// [1]: https://aws.amazon.com/blogs/compute/node-js-8-10-runtime-now-available-in-aws-lambda/
export default async (event, context: Context): Promise<any> => {
	const cleanup = logBeforeTimeout(context);

	const lastProcessedId = await getLatestProcessedId();
	console.log('processing recent games', lastProcessedId);
	if (!lastProcessedId) {
		throw new Error('Could not retrieve last processed id');
	}

	const communityInfos = await getUsersInCommunities();
	// console.log('got users', communityInfos?.length, communityInfos);
	const { games, newLastProcessedId } = await getRecentGames(lastProcessedId, communityInfos);
	// console.log('got games', games?.length, newLastProcessedId);
	await updateCommunities(games, communityInfos);
	// console.log('updated communities');
	await updateLastProcessedId(newLastProcessedId);
	console.log('updated last processed id');

	cleanup();

	return { statusCode: 200, body: null };
};
