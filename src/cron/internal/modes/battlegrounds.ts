import { CommunityInfoBattlegrounds, CommunityInfoConstructed } from '../../../model';
import { countGamesInLastSevenDays, updateGamesPerHour } from '../community';
import { InternalReplaySummaryDbRow } from '../replay-summary';
import { updateLeaderboard } from './leaderboard';

export const updateBattlegroundsCommunityInfo = (
	communityInfo: CommunityInfoBattlegrounds,
	games: readonly InternalReplaySummaryDbRow[],
): CommunityInfoConstructed => {
	const result = communityInfo ?? ({} as CommunityInfoBattlegrounds);
	result.leaderboard = updateLeaderboard(result?.leaderboard ?? [], games, leaderboardComparator, rankConverter);
	result.gamesPerHour = updateGamesPerHour(result.gamesPerHour ?? {}, games);
	result.gamesInLastSevenDays = countGamesInLastSevenDays(result.gamesPerHour);
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
