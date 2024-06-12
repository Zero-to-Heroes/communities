import { groupByFunction } from '@firestone-hs/aws-lambda-utils';
import { LeaderboardEntry } from '../../../model';
import { InternalReplaySummaryDbRow } from '../replay-summary';

export const updateLeaderboard = (
	existingLeaderboard: readonly LeaderboardEntry[],
	games: readonly InternalReplaySummaryDbRow[],
	rankComparator: (a: string, b: string) => number,
): readonly LeaderboardEntry[] => {
	const groupedByPlayer = groupByFunction((game: InternalReplaySummaryDbRow) => game.userName)(games);
	const uniqueUserNames = [
		...new Set(games.map((game) => game.userName)),
		...existingLeaderboard.map((info) => info.name),
	];
	const leaderboard: readonly LeaderboardEntry[] = uniqueUserNames.map((userName) => {
		const existingInfo = existingLeaderboard.find((info) => info.name === userName);
		const gamesForPlayer = groupedByPlayer[userName] || [];
		const allRanks = [
			...gamesForPlayer.map((game) => game.newPlayerRank ?? game.playerRank),
			existingInfo?.playerRank,
		].filter((rank) => rank);
		const bestRank = allRanks.length ? allRanks.sort(rankComparator)[0] : null;
		const result: LeaderboardEntry = {
			name: userName,
			playerRank: bestRank,
		};
		return result;
	});
	return leaderboard;
};
