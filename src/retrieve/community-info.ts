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
			type: communityInfo.type,
			name: communityInfo.name,
			description: communityInfo.description,
		};
		return result;
	});
};

export const retrieveJoinedCommunities = async (
	allUserIds: readonly string[],
): Promise<readonly CommunityOverview[]> => {
	const query = `
        SELECT communityId FROM community_members WHERE userId IN (?)
    `;
	const mysql = await getConnection();
	const result: any[] = await mysql.query(query, [allUserIds]);
	mysql.end();
	const joinedCommunityIds = result.map((r) => r.communityId);
	return retrieveCommunitiesOverview(joinedCommunityIds);
};
