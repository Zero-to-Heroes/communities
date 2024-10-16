import { ServerlessMysql } from 'serverless-mysql';
import { retrieveCommunityInfoForOutput } from '../cron/internal/community';
import { CommunityInfo, CommunityOverview } from '../model';

export const retrieveCommunitiesOverview = async (
	mysql: ServerlessMysql,
	communityIds: readonly string[],
): Promise<readonly (CommunityOverview | CommunityInfo)[]> => {
	if (!communityIds?.length) {
		console.warn('no community ids', communityIds);
		return [];
	}

	const communityInfoQuery = `
        SELECT * FROM communities WHERE communityId IN (?)
    `;
	const communityInfoResult: readonly any[] = await mysql.query(communityInfoQuery, [communityIds]);

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

export const retrieveJoinedCommunities = async (
	mysql: ServerlessMysql,
	userName: string,
): Promise<readonly CommunityOverview[]> => {
	const query = `
        SELECT communityId FROM community_members WHERE userName = ?
    `;
	const result: any[] = await mysql.query(query, [userName]);
	console.log('retrieved communities', result);
	const joinedCommunityIds = result.map((r) => r.communityId).filter((id) => !!id);
	console.debug('got comunities for', userName, joinedCommunityIds);
	return retrieveCommunitiesOverview(mysql, joinedCommunityIds);
};
