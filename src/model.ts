/* eslint-disable @typescript-eslint/no-empty-interface */
export interface UserInfoInput {
	userName: string;
}

export interface JoinCommunityInput extends UserInfoInput {
	code: string;
}

export interface CreateCommunityInput {
	userName: string;
	name: string;
	description: string;
}

export interface RetrieveCommunityInput {
	userName: string;
	communityId: string;
}

export interface CommunityOverview {
	id: string;
	name: string;
	description: string;
}

export interface CommunityInfo extends CommunityOverview {
	numberOfMembers: number;
	members: string[];
	standardInfo: CommunityInfoConstructed;
	wildInfo: CommunityInfoConstructed;
	twistInfo: CommunityInfoConstructed;
	battlegroundsInfo: CommunityInfoBattlegrounds;
	battlegroundsDuoInfo: CommunityInfoBattlegrounds;
	arenaInfo: CommunityInfoArena;

	totalGamesPlayed: number;
	totalTimePlayed: number;
	gamesInLastSevenDays?: number;
}

export interface CommunityInfoGameMode {
	leaderboard: readonly LeaderboardEntry[];
	gamesPerHour: { [hour: string]: number };
	gamesInLastSevenDays?: number;
	// lastGames: readonly GameInfo[];
}

export interface CommunityInfoConstructed extends CommunityInfoGameMode {}

export interface CommunityInfoBattlegrounds extends CommunityInfoGameMode {}

export interface CommunityInfoArena extends CommunityInfoGameMode {
	leaderboard: readonly LeaderboardEntryArena[];
}

export interface GameInfo {
	playerClass: string;
	opponentClass: string;
	result: 'won' | 'lost' | 'tied';
	// additionalResult: string;
	playerRank: string;
}

export interface LeaderboardEntry {
	name: string;
	displayName: string;
	currentRank: string;
	bestRank: string;
}

export interface LeaderboardEntryArena extends LeaderboardEntry {
	// Number of wins for a run, grouped by day
	runsPerDay: { [day: string]: readonly number[] };
}
