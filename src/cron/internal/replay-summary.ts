import { getConnectionReadOnly } from '@firestone-hs/aws-lambda-utils';
import { InternalCommunityInfo } from './communities';

export const getRecentGames = async (
	lastProcessedId: number | null,
	communityInfos: readonly InternalCommunityInfo[],
): Promise<{ games: readonly InternalReplaySummaryDbRow[]; newLastProcessedId: number }> => {
	const uniqueUserNames = communityInfos
		.flatMap((info) => info.userNames)
		.filter((value, index, self) => self.indexOf(value) === index);
	console.log(
		'uniqueUserNames',
		uniqueUserNames,
		communityInfos.flatMap((info) => info.userNames),
	);
	const mysql = await getConnectionReadOnly();
	const query = `
		SELECT * FROM replay_summary
		WHERE id > ?
		AND gameMode IN ('ranked', 'battlegrounds', 'battlegrounds-duo', 'arena')
		AND userName IS NOT NULL
	`;
	const games: readonly InternalReplaySummaryDbRow[] = await mysql.query(query, [lastProcessedId]);
	mysql.end();
	const result = games.filter((game) => uniqueUserNames.includes(game.userName));
	return { games: result, newLastProcessedId: games.length ? games[games.length - 1].id : lastProcessedId };
};

export interface InternalReplaySummaryDbRow {
	readonly id: number;
	readonly userName: string;
	readonly playerName: string;
	readonly playerRank: string;
	readonly newPlayerRank: string;
	readonly gameMode: 'ranked' | 'battlegrounds' | 'battlegrounds-duo' | 'arena';
	readonly gameFormat: 'standard' | 'wild' | 'twist';
}
