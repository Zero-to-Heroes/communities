import { getConnection } from '@firestone-hs/aws-lambda-utils';
import { retrieveCommunityInfo, saveCommunityInfo } from '../cron/internal/community';
import { CommunityInfo, CommunityInfoGameMode, LeaveCommunityInput } from '../model';

export default async (event): Promise<any> => {
	const headers = {
		'Access-Control-Allow-Headers':
			'Accept,Accept-Language,Content-Language,Content-Type,Authorization,x-correlation-id,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
		'Access-Control-Expose-Headers': 'x-my-header-out',
		'Access-Control-Allow-Methods': 'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT',
		'Access-Control-Allow-Origin': event.headers?.Origin || event.headers?.origin || '*',
	};
	// Preflight
	if (!event.body) {
		const response = {
			statusCode: 200,
			body: null,
			headers: headers,
		};
		return response;
	}

	console.debug('received event', event);
	const input: LeaveCommunityInput = JSON.parse(event.body);
	const left = await performLeave(input.userName, input.communityId);
	console.debug('leaveResult', left, input);
	if (!left) {
		const response = {
			statusCode: 400,
			body: null,
			headers: headers,
		};
		return response;
	}

	return {
		statusCode: 200,
		headers: headers,
		body: JSON.stringify(true),
	};
};

const performLeave = async (userName: string, communityId: string): Promise<boolean> => {
	const communityIdQuery = `
		DELETE FROM community_members WHERE userName = ? AND communityId = ?
	`;
	const mysql = await getConnection();
	const result = await mysql.query(communityIdQuery, [userName, communityId]);

	const communityInfo: CommunityInfo = await retrieveCommunityInfo(communityId);
	if (!communityInfo) {
		return false;
	}

	const members = communityInfo.members || [];
	communityInfo.members = [...new Set(members.filter((m) => m !== userName))];
	communityInfo.standardInfo = removeUserFromModeInfo(communityInfo.standardInfo, userName);
	communityInfo.wildInfo = removeUserFromModeInfo(communityInfo.wildInfo, userName);
	communityInfo.twistInfo = removeUserFromModeInfo(communityInfo.twistInfo, userName);
	communityInfo.arenaInfo = removeUserFromModeInfo(communityInfo.arenaInfo, userName);
	communityInfo.battlegroundsInfo = removeUserFromModeInfo(communityInfo.battlegroundsInfo, userName);
	communityInfo.battlegroundsDuoInfo = removeUserFromModeInfo(communityInfo.battlegroundsDuoInfo, userName);
	await saveCommunityInfo(communityInfo);
	return true;
};

const removeUserFromModeInfo = <T extends CommunityInfoGameMode>(modeInfo: T, userName: string): T => {
	const result = { ...modeInfo };
	result.leaderboard = result.leaderboard.filter((entry) => entry.name !== userName);
	return result;
};
