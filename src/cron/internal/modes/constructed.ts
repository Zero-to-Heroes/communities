import { CommunityInfoConstructed } from '../../../model';
import { InternalReplaySummaryDbRow } from '../replay-summary';
import { updateLeaderboard } from './leaderboard';

export const updateConstructedCommunityInfo = (
	communityInfo: CommunityInfoConstructed,
	games: readonly InternalReplaySummaryDbRow[],
): CommunityInfoConstructed => {
	const result = communityInfo ?? ({} as CommunityInfoConstructed);
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
	if (rank.includes('legend-')) {
		const legendRank = parseInt(rank.split('-')[1]);
		const lowestLegendRank = 200_000;
		const internalRank = lowestLegendRank - legendRank;
		return internalRank;
	}

	const [league, division] = rank.split('-');
	const internalRank = 10 * parseInt(league) + parseInt(division);
	return 50 - internalRank;
};
