import { getConnection } from '@firestone-hs/aws-lambda-utils';
import { randomUUID } from 'crypto';
import { sanitizeForOutput, saveCommunityInfo } from '../cron/internal/community';
import { CommunityInfo, CreateCommunityInput } from '../model';

export default async (event): Promise<any> => {
	const headers = {
		'Access-Control-Allow-Headers':
			'Accept,Accept-Language,Content-Language,Content-Type,Authorization,x-correlation-id,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
		'Access-Control-Expose-Headers': 'x-my-header-out',
		'Access-Control-Allow-Methods': 'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT',
		'Access-Control-Allow-Origin': event.headers?.Origin || event.headers?.origin || '*',
	};

	// Preflight
	// if (!event.body) {
	// 	const response = {
	// 		statusCode: 200,
	// 		body: null,
	// 		headers: headers,
	// 	};
	// 	return response;
	// }

	console.debug('received event', event);
	// const input: CreateCommunityInput = JSON.parse(event.body);
	const input: CreateCommunityInput = {
		adminUserName: 'doseofcoffeestream',
		description: `Easily the best guild around.`,
		name: `The Roastery`,
		joinCode: 'DoC',
	};
	const communityId = await createCommunityInDb(input);
	if (!communityId) {
		const response = {
			statusCode: 400,
			body: null,
			headers: headers,
		};
		return response;
	}

	const communityInfo = await createCommunityInfoInS3(communityId, input);
	return {
		statusCode: 200,
		headers: headers,
		body: JSON.stringify(communityInfo),
	};
};

// Create the community in the community table, add the admin to its members
// It returns the communityId
const createCommunityInDb = async (input: CreateCommunityInput): Promise<string> => {
	const communityId = randomUUID();
	const communityIdQuery = `
		INSERT INTO communities (communityId, joinCode, name)
		VALUES (?, ?, ?)
	`;
	const mysql = await getConnection();
	const result = await mysql.query(communityIdQuery, [communityId, input.joinCode, input.name]);
	console.debug('createCommunityInDb', result);

	const joinQuery = `
		INSERT INTO community_members (communityId, userName)
		VALUES (?, ?)
	`;
	const joinResult: any[] = await mysql.query(joinQuery, [communityId, input.adminUserName]);
	console.debug('joinResult', joinResult);
	mysql.end();

	return communityId;
};

const createCommunityInfoInS3 = async (communityId: string, input: CreateCommunityInput): Promise<CommunityInfo> => {
	const communityInfo: CommunityInfo = {
		id: communityId,
		name: input.name,
		description: input.description,
		members: [input.adminUserName],
		numberOfMembers: 1,
		memberBattleTags: [],
		totalGamesPlayed: 0,
		totalTimePlayed: 0,
		gamesInLastSevenDays: 0,
		arenaInfo: {
			leaderboard: [],
			gamesPerHour: {},
			gamesInLastSevenDays: 0,
		},
		standardInfo: {
			leaderboard: [],
			gamesPerHour: {},
			gamesInLastSevenDays: 0,
		},
		wildInfo: {
			leaderboard: [],
			gamesPerHour: {},
			gamesInLastSevenDays: 0,
		},
		twistInfo: {
			leaderboard: [],
			gamesPerHour: {},
			gamesInLastSevenDays: 0,
		},
		battlegroundsInfo: {
			leaderboard: [],
			gamesPerHour: {},
			gamesInLastSevenDays: 0,
		},
		battlegroundsDuoInfo: {
			leaderboard: [],
			gamesPerHour: {},
			gamesInLastSevenDays: 0,
		},
	};
	await saveCommunityInfo(communityInfo);
	return sanitizeForOutput(communityInfo);
};
