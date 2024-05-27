import { getConnection } from '@firestone-hs/aws-lambda-utils';
import { CommunityInfo } from '../model';

export const retrieveCommunityInfo = async (communityIds: readonly string[]): Promise<readonly CommunityInfo[]> => {
	const mysql = await getConnection();
	const communityInfoQuery = `
        SELECT * FROM communities WHERE id IN (?)
    `;
	const communityInfoResult: readonly any[] = await mysql.query(communityInfoQuery, [communityIds]);
	mysql.end();
	return communityInfoResult.map((communityInfo) => {
		const result: CommunityInfo = {
			id: communityInfo.id,
			name: communityInfo.name,
		} as CommunityInfo;
		return result;
	});
};

export const retrieveJoinedCommunities = async (allUserIds: readonly string[]): Promise<readonly CommunityInfo[]> => {
	const query = `
        SELECT communityId FROM community_members WHERE userId IN (?)
    `;
	const mysql = await getConnection();
	const result: any[] = await mysql.query(query, [allUserIds]);
	mysql.end();
	const joinedCommunityIds = result.map((r) => r.communityId);
	return retrieveCommunityInfo(joinedCommunityIds);
};
