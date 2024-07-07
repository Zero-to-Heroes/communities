import { groupByFunction } from '@firestone-hs/aws-lambda-utils';
import { LeaderboardEntry } from '../../../model';
import { InternalReplaySummaryDbRow } from '../replay-summary';

export const updateLeaderboard = <T extends LeaderboardEntry>(
	existingLeaderboard: readonly T[],
	games: readonly InternalReplaySummaryDbRow[],
	rankComparator: (a: string, b: string) => number,
	rankConverter: (rank: string) => number,
	leaderboardEntryBuilder: (
		userName: string,
		existingInfo: T,
		gamesForPlayer: readonly InternalReplaySummaryDbRow[],
		rankComparator: (a: string, b: string) => number,
	) => T,
): readonly T[] => {
	const groupedByPlayer = groupByFunction((game: InternalReplaySummaryDbRow) => game.userName)(games);
	const userNamesFromGames = Object.keys(groupedByPlayer);
	const userNamesFromCommunity = existingLeaderboard.map((info) => info.name);
	// console.debug('userNamesFromGames', userNamesFromGames);
	// console.debug('userNamesFromCommunity', userNamesFromCommunity);
	const uniqueUserNames = [...new Set([...userNamesFromGames, ...userNamesFromCommunity])];
	const leaderboard: readonly T[] = uniqueUserNames
		.map((userName) =>
			leaderboardEntryBuilder(
				userName,
				existingLeaderboard.find((info) => info.name === userName),
				groupedByPlayer[userName] ?? [],
				rankComparator,
			),
		)
		.filter((info) => !!info?.currentRank)
		.sort((a, b) => rankConverter(b.currentRank) - rankConverter(a.currentRank));

	return leaderboard;
};

export const buildLeaderboardEntryForPlayer = (
	userName: string,
	existingInfo: LeaderboardEntry,
	gamesForPlayer: readonly InternalReplaySummaryDbRow[],
	rankComparator: (a: string, b: string) => number,
): LeaderboardEntry => {
	// console.debug(
	// 	'games without rank',
	// 	gamesForPlayer.filter((game) => !game.playerRank),
	// );
	const allRanks = [
		...gamesForPlayer.map((game) => game.newPlayerRank || game.playerRank),
		existingInfo?.currentRank,
	].filter((rank) => rank);
	const bestRank = allRanks.length ? allRanks.sort(rankComparator)[0] : null;
	const result: LeaderboardEntry = {
		name: userName,
		displayName: gamesForPlayer.length
			? gamesForPlayer[gamesForPlayer.length - 1].playerName?.split('#')[0]
			: existingInfo?.displayName,
		currentRank: gamesForPlayer.length
			? gamesForPlayer[gamesForPlayer.length - 1].playerRank
			: existingInfo?.currentRank,
		bestRank: bestRank,
	};
	// console.debug('built leaderboard entry', result, existingInfo);
	return result;
};
