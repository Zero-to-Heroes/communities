export const constructedLeaderboardComparator = (a: string, b: string): number => {
	const aRank = buildRank(a);
	const bRank = buildRank(b);
	return bRank - aRank;
};

// The higher, the better
const buildRank = (rank: string): number => {
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
