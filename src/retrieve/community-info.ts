import { getConnection } from '@firestone-hs/aws-lambda-utils';
import { retrieveCommunityInfoForOutput } from '../cron/internal/community';
import { CommunityInfo, CommunityOverview } from '../model';

export const retrieveCommunitiesOverview = async (
	communityIds: readonly string[],
): Promise<readonly (CommunityOverview | CommunityInfo)[]> => {
	const mysql = await getConnection();
	const communityInfoQuery = `
        SELECT * FROM communities WHERE communityId IN (?)
    `;
	const communityInfoResult: readonly any[] = await mysql.query(communityInfoQuery, [communityIds]);
	mysql.end();

	return await Promise.all(
		communityInfoResult.map(async (dbInfo) => {
			const communityInfo = await retrieveCommunityInfoForOutput(dbInfo.communityId);
			const result: CommunityInfo = {
				...(communityInfo ?? ({} as CommunityInfo)),
				id: communityInfo?.id ?? dbInfo.communityId,
				name: communityInfo?.name ?? dbInfo.name,
			};
			return result;
		}),
	);
};

export const retrieveJoinedCommunities = async (userName: string): Promise<readonly CommunityOverview[]> => {
	const query = `
        SELECT communityId FROM community_members WHERE userName = ?
    `;
	const mysql = await getConnection();
	const result: any[] = await mysql.query(query, [userName]);
	console.log('retrieved communities', result);
	mysql.end();
	const joinedCommunityIds = result.map((r) => r.communityId);
	console.debug('got comunities for', userName, joinedCommunityIds);
	return retrieveCommunitiesOverview(joinedCommunityIds);
};
