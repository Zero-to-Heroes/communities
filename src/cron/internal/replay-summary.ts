import { ServerlessMysql } from 'serverless-mysql';
import { InternalCommunityInfo } from './communities';

export const getRecentGames = async (
	mysql: ServerlessMysql,
	lastProcessedId: number | null,
	communityInfos: readonly InternalCommunityInfo[],
): Promise<{ games: readonly InternalReplaySummaryDbRow[]; newLastProcessedId: number }> => {
	const uniqueUserNames = communityInfos
		.flatMap((info) => info.userNames)
		.filter((value, index, self) => self.indexOf(value) === index);
	// console.log(
	// 	'uniqueUserNames',
	// 	uniqueUserNames,
	// 	communityInfos.flatMap((info) => info.userNames),
	// );
	const query = `
		SELECT * FROM replay_summary
		WHERE id > ?
		AND gameMode IN ('ranked', 'battlegrounds', 'battlegrounds-duo', 'arena', 'friendly')
		AND userName IS NOT NULL
	`;
	const games: readonly InternalReplaySummaryDbRow[] = await mysql.query(query, [lastProcessedId]);
	const result = games.filter((game) => uniqueUserNames.includes(game.userName));
	return { games: result, newLastProcessedId: games.length ? games[games.length - 1].id : lastProcessedId };
};

export interface InternalReplaySummaryDbRow {
	readonly id: number;
	readonly uniqueGameId: string;
	readonly creationDate: string;
	readonly userName: string;
	readonly playerName: string;
	readonly playerRank: string;
	readonly newPlayerRank: string;
	readonly playerCardId: string;
	readonly opponentName: string;
	readonly result: 'won' | 'lost' | 'tied';
	readonly gameMode: 'ranked' | 'battlegrounds' | 'battlegrounds-duo' | 'arena' | 'friendly';
	readonly gameFormat: 'standard' | 'wild' | 'twist';
	readonly allowGameShare: boolean;
}
