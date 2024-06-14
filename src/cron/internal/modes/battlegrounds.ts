import { CommunityInfoBattlegrounds, CommunityInfoConstructed } from '../../../model';
import { InternalReplaySummaryDbRow } from '../replay-summary';
import { updateLeaderboard } from './leaderboard';

export const updateBattlegroundsCommunityInfo = (
	communityInfo: CommunityInfoBattlegrounds,
	games: readonly InternalReplaySummaryDbRow[],
): CommunityInfoConstructed => {
	const result = communityInfo ?? ({} as CommunityInfoBattlegrounds);
	result.leaderboard = updateLeaderboard(result?.leaderboard ?? [], games, leaderboardComparator, rankConverter);
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
