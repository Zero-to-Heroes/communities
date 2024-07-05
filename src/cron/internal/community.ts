import { S3 } from '@firestone-hs/aws-lambda-utils';
import { CommunityInfo } from 'src/model';
import { InternalCommunityInfo } from './communities';
import { updateArenaCommunityInfo } from './modes/arena';
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
	existingCommunityInfo.arenaInfo = updateArenaCommunityInfo(
		existingCommunityInfo.arenaInfo,
		games.filter((game) => game.gameMode === 'arena'),
	);

	existingCommunityInfo.members = existingCommunityInfo.members.filter((m) => !!m?.length);

	await saveCommunityInfo(existingCommunityInfo);
};

export const retrieveCommunityInfo = async (communityId: string): Promise<CommunityInfo> => {
	const infoStr = await s3.readContentAsString('static.zerotoheroes.com', `api/communities/${communityId}.json`);
	return JSON.parse(infoStr);
};

export const retrieveCommunityInfoForOutput = async (communityId: string): Promise<CommunityInfo> => {
	const communityInfo = await retrieveCommunityInfo(communityId);
	const finalCommunity: CommunityInfo = sanitizeForOutput(communityInfo);
	return finalCommunity;
};

export const saveCommunityInfo = async (communityInfo: CommunityInfo): Promise<void> => {
	await s3.writeFile(communityInfo, 'static.zerotoheroes.com', `api/communities/${communityInfo.id}.json`);
};

export const updateGamesPerHour = (
	gamesPerHour: { [hour: string]: number },
	games: readonly InternalReplaySummaryDbRow[],
): { [hour: string]: number } => {
	const result = { ...gamesPerHour };
	for (const game of games) {
		const dateWithHours = new Date(game.creationDate).toISOString().substring(0, 13) + ':00:00.000Z';
		result[dateWithHours] = (result[dateWithHours] ?? 0) + 1;
	}
	return result;
};

export const countGamesInLastSevenDays = (gamesPerHour: { [hour: string]: number }): number => {
	const lastSevenDays = new Date();
	lastSevenDays.setDate(lastSevenDays.getDate() - 7);
	return Object.keys(gamesPerHour)
		.filter((hour) => new Date(hour) > lastSevenDays)
		.reduce((acc, hour) => acc + gamesPerHour[hour], 0);
};

const LEADERBOARD_ENTRIES = 50;
export const sanitizeForOutput = (community: CommunityInfo): CommunityInfo => {
	const result = { ...community };
	result.numberOfMembers = [...new Set(result.members)].length;
	result.standardInfo.leaderboard = result.standardInfo.leaderboard.slice(0, LEADERBOARD_ENTRIES);
	result.wildInfo.leaderboard = result.wildInfo.leaderboard.slice(0, LEADERBOARD_ENTRIES);
	result.twistInfo.leaderboard = result.twistInfo.leaderboard.slice(0, LEADERBOARD_ENTRIES);
	result.battlegroundsInfo.leaderboard = result.battlegroundsInfo.leaderboard.slice(0, LEADERBOARD_ENTRIES);
	result.battlegroundsDuoInfo.leaderboard = result.battlegroundsDuoInfo.leaderboard.slice(0, LEADERBOARD_ENTRIES);
	result.arenaInfo.leaderboard = result.arenaInfo.leaderboard.slice(0, LEADERBOARD_ENTRIES);

	result.gamesInLastSevenDays =
		(result.standardInfo?.gamesInLastSevenDays ?? 0) +
		(result.wildInfo?.gamesInLastSevenDays ?? 0) +
		(result.twistInfo?.gamesInLastSevenDays ?? 0) +
		(result.battlegroundsInfo?.gamesInLastSevenDays ?? 0) +
		(result.battlegroundsDuoInfo?.gamesInLastSevenDays ?? 0) +
		(result.arenaInfo?.gamesInLastSevenDays ?? 0);

	delete result.members;
	delete result.standardInfo?.gamesPerHour;
	delete result.wildInfo?.gamesPerHour;
	delete result.twistInfo?.gamesPerHour;
	delete result.battlegroundsInfo?.gamesPerHour;
	delete result.battlegroundsDuoInfo?.gamesPerHour;
	delete result.arenaInfo?.gamesPerHour;

	return result;
};
