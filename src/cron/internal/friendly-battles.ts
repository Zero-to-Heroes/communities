import { groupByFunction } from '@firestone-hs/aws-lambda-utils';
import { CommunityFriendlyBattles, FriendlyBattle, FriendlyBattlePlayer } from '../../model';
import { InternalReplaySummaryDbRow } from './replay-summary';

export const updateFriendlyBattles = (
	friendlyBattles: CommunityFriendlyBattles,
	games: readonly InternalReplaySummaryDbRow[],
): CommunityFriendlyBattles => {
	const groupedByGameId = groupByFunction((game: InternalReplaySummaryDbRow) => game.uniqueGameId)(games);
	const newFriendlyBattles: readonly FriendlyBattle[] = Object.keys(groupedByGameId)
		.filter((gameId) => groupedByGameId[gameId].length > 1)
		.map((gameId) => buildFriendlyBattle(groupedByGameId[gameId]));
	console.debug('newFriendlyBattles', newFriendlyBattles);
	if (newFriendlyBattles.length === 0) {
		return friendlyBattles;
	}

	const newBattlesPerDay = friendlyBattles?.battlesPerDay ?? {};
	const day = new Date().toISOString().slice(0, 10);
	const existingBattlesForDay: readonly FriendlyBattle[] = newBattlesPerDay[day] ?? [];
	newBattlesPerDay[day] = [...existingBattlesForDay, ...newFriendlyBattles];

	const result: CommunityFriendlyBattles = {
		battlesPerDay: newBattlesPerDay,
		battles: [],
	};
	return result;
};

const buildFriendlyBattle = (games: readonly InternalReplaySummaryDbRow[]): FriendlyBattle => {
	const refGame = games[0];
	const players: readonly FriendlyBattlePlayer[] = games.map((game) => buildFriendlyBattlePlayer(game));
	const result: FriendlyBattle = {
		creationDate: new Date(refGame.creationDate),
		gameMode: refGame.gameMode,
		players: players,
		winnerIndex: games.findIndex((game) => game.result === 'won') ?? 'tie',
	};
	return result;
};

const buildFriendlyBattlePlayer = (game: InternalReplaySummaryDbRow): FriendlyBattlePlayer => {
	const result: FriendlyBattlePlayer = {
		name: game.playerName?.split('#')[0],
		heroCardId: game.playerCardId,
		rank: game.playerRank,
	};
	return result;
};
