import { S3 } from '@firestone-hs/aws-lambda-utils';
import { CommunityInfo } from 'src/model';
import { InternalCommunityInfo } from './communities';
import { updateBattlegroundsCommunityInfo } from './modes/battlegrounds';
import { updateConstructedCommunityInfo } from './modes/constructed';
import { InternalReplaySummaryDbRow } from './replay-summary';

const s3 = new S3();

export const updateCommunity = async (
	communityInfo: InternalCommunityInfo,
	games: readonly InternalReplaySummaryDbRow[],
): Promise<void> => {
	const existingCommunityInfo: CommunityInfo = await retrieveCommunityInfo(communityInfo.communityId);
	// Update the leaderboards
	const rankedGames = games.filter((game) => game.gameMode === 'ranked');
	existingCommunityInfo.standardInfo = updateConstructedCommunityInfo(
		existingCommunityInfo.standardInfo,
		rankedGames.filter((game) => game.gameFormat === 'standard'),
	);
	existingCommunityInfo.wildInfo = updateConstructedCommunityInfo(
		existingCommunityInfo.wildInfo,
		rankedGames.filter((game) => game.gameFormat === 'wild'),
	);
	existingCommunityInfo.twistInfo = updateConstructedCommunityInfo(
		existingCommunityInfo.twistInfo,
		rankedGames.filter((game) => game.gameFormat === 'twist'),
	);
	existingCommunityInfo.battlegroundsInfo = updateBattlegroundsCommunityInfo(
		existingCommunityInfo.battlegroundsInfo,
		games.filter((game) => game.gameMode === 'battlegrounds'),
	);
	existingCommunityInfo.battlegroundsDuoInfo = updateBattlegroundsCommunityInfo(
		existingCommunityInfo.battlegroundsDuoInfo,
		games.filter((game) => game.gameMode === 'battlegrounds-duo'),
	);
	// existingCommunityInfo.arenaInfo = updateArenaCommunityInfo(
	// 	existingCommunityInfo.arenaInfo,
	// 	games.filter((game) => game.gameMode === 'arena'),
	// );
	await saveCommunityInfo(existingCommunityInfo);
};

export const retrieveCommunityInfo = async (communityId: string): Promise<CommunityInfo> => {
	const infoStr = await s3.readContentAsString('static.zerotoheroes.com', `api/communities/${communityId}.json`);
	return JSON.parse(infoStr);
};

export const saveCommunityInfo = async (communityInfo: CommunityInfo): Promise<void> => {
	await s3.writeFile(communityInfo, 'static.zerotoheroes.com', `api/communities/${communityInfo.id}.json`);
};
