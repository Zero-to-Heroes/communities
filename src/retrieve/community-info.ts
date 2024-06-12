import { getConnection } from '@firestone-hs/aws-lambda-utils';
import { CommunityOverview } from '../model';

export const retrieveCommunitiesOverview = async (
	communityIds: readonly string[],
): Promise<readonly CommunityOverview[]> => {
	const mysql = await getConnection();
	const communityInfoQuery = `
        SELECT * FROM communities WHERE communityId IN (?)
    `;
	const communityInfoResult: readonly any[] = await mysql.query(communityInfoQuery, [communityIds]);
	mysql.end();
	return communityInfoResult.map((communityInfo) => {
		const result: CommunityOverview = {
			id: communityInfo.communityId,
			name: communityInfo.name,
			description: communityInfo.description,
		};
		return result;
	});
};

export const retrieveJoinedCommunities = async (userName: string): Promise<readonly CommunityOverview[]> => {
	const query = `
        SELECT communityId FROM community_members WHERE userName = ?
    `;
	const mysql = await getConnection();
	const result: any[] = await mysql.query(query, [userName]);
	mysql.end();
	const joinedCommunityIds = result.map((r) => r.communityId);
	return retrieveCommunitiesOverview(joinedCommunityIds);
};
