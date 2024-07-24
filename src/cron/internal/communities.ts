/* eslint-disable no-extra-boolean-cast */
import { getConnectionReadOnly, groupByFunction } from '@firestone-hs/aws-lambda-utils';
import { GlobalOpenSkill } from '../../model';
import { updateCommunity } from './community';
import { InternalReplaySummaryDbRow } from './replay-summary';

export const updateCommunities = async (
	games: readonly InternalReplaySummaryDbRow[],
	communityInfos: readonly InternalCommunityInfo[],
	globalOpenSkill: GlobalOpenSkill,
): Promise<void> => {
	for (const communityInfo of communityInfos) {
		const gamesForCommunity = games.filter((game) => communityInfo.userNames.includes(game.userName));
		if (!!gamesForCommunity?.length) {
			console.log('got games for community', gamesForCommunity?.length, communityInfo.communityId);
			await updateCommunity(communityInfo, gamesForCommunity, globalOpenSkill);
			console.log('updated community');
		}
	}
};

export const getUsersInCommunities = async (): Promise<readonly InternalCommunityInfo[]> => {
	const mysql = await getConnectionReadOnly();
	const query = `SELECT communityId, userName FROM community_members`;
	const result: readonly any[] = await mysql.query(query);
	mysql.end();
	const groupedByCommunity = groupByFunction((info: { communityId: string; userName: string }) => info.communityId)(
		result,
	);
	const internalCommunityInfos: readonly InternalCommunityInfo[] = Object.keys(groupedByCommunity).map(
		(communityId) => {
			return {
				communityId: communityId,
				userNames: groupedByCommunity[communityId].map((info) => info.userName),
			};
		},
	);
	return internalCommunityInfos;
};

export interface InternalCommunityInfo {
	readonly communityId: string;
	readonly userNames: readonly string[];
}
