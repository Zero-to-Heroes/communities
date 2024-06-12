import { S3 } from '@firestone-hs/aws-lambda-utils';
import { CommunityInfo, CommunityInfoConstructed } from 'src/model';
import { InternalCommunityInfo } from './communities';
import { constructedLeaderboardComparator } from './modes/constructed';
import { updateLeaderboard } from './modes/leaderboard';
import { InternalReplaySummaryDbRow } from './replay-summary';

const s3 = new S3();

export const updateCommunity = async (
	communityInfo: InternalCommunityInfo,
	games: readonly InternalReplaySummaryDbRow[],
): Promise<void> => {
	const existingCommunityInfo: CommunityInfo = await retrieveCommunityInfo(communityInfo.communityId);
	// Update the leaderboards
	existingCommunityInfo.standardInfo = existingCommunityInfo.standardInfo ?? ({} as CommunityInfoConstructed);
	existingCommunityInfo.standardInfo.leaderboard = updateLeaderboard(
		existingCommunityInfo.standardInfo?.leaderboard ?? [],
		games.filter((game) => game.gameMode === 'ranked').filter((game) => game.gameFormat === 'standard'),
		constructedLeaderboardComparator,
	);
	// existingCommunityInfo.battlegroundsInfo = updateBattlegroundsInfo(existingCommunityInfo.battlegroundsInfo, games);
	// existingCommunityInfo.arenaInfo = updateArenaInfo(existingCommunityInfo.arenaInfo, games);
	await saveCommunityInfo(existingCommunityInfo);
};

export const retrieveCommunityInfo = async (communityId: string): Promise<CommunityInfo> => {
	const infoStr = await s3.readContentAsString('static.zerotoheroes.com', `api/communities/${communityId}.json`);
	return JSON.parse(infoStr);
};

export const saveCommunityInfo = async (communityInfo: CommunityInfo): Promise<void> => {
	await s3.writeFile(communityInfo, 'static.zerotoheroes.com', `api/communities/${communityInfo.id}.json`);
};
