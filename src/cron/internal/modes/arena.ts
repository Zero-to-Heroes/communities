import { CommunityInfoArena, LeaderboardEntryArena } from '../../../model';
import { countGamesInLastSevenDays, updateGamesPerHour } from '../community';
import { InternalReplaySummaryDbRow } from '../replay-summary';
import { updateLeaderboard } from './leaderboard';

export const updateArenaCommunityInfo = (
	communityInfo: CommunityInfoArena,
	games: readonly InternalReplaySummaryDbRow[],
): CommunityInfoArena => {
	const result = communityInfo ?? ({} as CommunityInfoArena);

	// TODO: retired runs are not handled
	result.leaderboard = updateLeaderboard(
		result?.leaderboard ?? [],
		games,
		leaderboardComparator,
		rankConverter,
		buildLeaderboardEntryForPlayer,
	);
	result.gamesPerHour = updateGamesPerHour(result.gamesPerHour ?? {}, games);
	result.gamesInLastSevenDays = countGamesInLastSevenDays(result.gamesPerHour);
	return result;
};

const buildLeaderboardEntryForPlayer = (
	userName: string,
	existingInfo: LeaderboardEntryArena,
	gamesForPlayer: readonly InternalReplaySummaryDbRow[],
	rankComparator: (a: string, b: string) => number,
): LeaderboardEntryArena => {
	const endOfRunGames = gamesForPlayer
		.filter((game) => game.playerRank?.includes('-'))
		.filter((game) => {
			const [wins, losses] = game.playerRank.split('-').map((elt) => parseInt(elt));
			return (wins === 11 && game.result === 'won') || (losses === 2 && game.result === 'lost');
		});
	console.debug('updating arena entry for player', userName, gamesForPlayer.length, endOfRunGames.length);

	const day = new Date().toISOString().slice(0, 10);
	const existingRunsPerDay: {
		[day: string]: readonly number[];
	} = existingInfo?.runsPerDay ?? {};
	const existingRunsForDay: readonly number[] = existingRunsPerDay[day] ?? [];
	const newRunsForDay = [
		...existingRunsForDay,
		...endOfRunGames.map((game) => parseInt(game.playerRank.split('-')[0])),
	];
	console.log('newRunsForDay', day, newRunsForDay);
	existingRunsPerDay[day] = newRunsForDay;
	console.log('existingRunsForDay', existingRunsPerDay);
	// Keep only the last 20 days
	// TODO: make
	const newRunsPerDay = Object.keys(existingRunsPerDay)
		.filter((d) => new Date().getTime() - new Date(d).getTime() < 20 * 24 * 60 * 60 * 1000)
		.reduce((acc, d) => {
			acc[d] = existingRunsPerDay[d];
			return acc;
		}, {} as { [day: string]: readonly number[] });
	console.log('newRunsPerDay', newRunsPerDay);

	const allRunsFlat = Object.values(newRunsPerDay).flat();
	const playerScore = allRunsFlat.reduce((acc, val) => acc + val, 0) / allRunsFlat.length;
	const currentBest = isNaN(parseInt(existingInfo?.bestRank ?? 'invalid')) ? 0 : Math.max(...allRunsFlat);

	const result: LeaderboardEntryArena = {
		name: userName,
		displayName: gamesForPlayer.length
			? gamesForPlayer[gamesForPlayer.length - 1].playerName?.split('#')[0]
			: existingInfo?.displayName,
		currentRank: '' + playerScore,
		bestRank: Math.max(currentBest, playerScore) + '',
		runsPerDay: newRunsPerDay,
	};
	// console.debug('built leaderboard entry', result, existingInfo);
	return result;
};

const leaderboardComparator = (a: string, b: string): number => {
	const aRank = rankConverter(a);
	const bRank = rankConverter(b);
	return bRank - aRank;
};

// The higher, the better
const rankConverter = (rank: string): number => {
	return parseInt(rank);
};
