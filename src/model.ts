/* eslint-disable @typescript-eslint/no-empty-interface */
export interface UserInfoInput {
	userId: string;
	userName?: string;
}

export interface JoinCommunityInput extends UserInfoInput {
	code: string;
}

export interface CreateCommunityInput {
	userId: string;
	userName?: string;
	name: string;
	description: string;
}

export interface RetrieveCommunityInput {
	userId: string;
	communityId: string;
}

export interface CommunityOverview {
	id: string;
	name: string;
	description: string;
	type: 'constructed' | 'battlegrounds' | 'arena';
}

export interface CommunityInfo extends CommunityOverview {
	numberOfMembers: number;
	totalGamesPlayed: number;
	totalTimePlayed: number;
	lastGames: readonly GameInfo[];
}

export interface CommunityInfoGameMode {
	leaderboard: readonly LeaderboardEntry[];
	lastGames: readonly GameInfo[];
}

export interface CommunityInfoConstructed extends CommunityInfoGameMode {}

export interface CommunityInfoBattlegrounds extends CommunityInfoGameMode {}

export interface CommunityInfoArena extends CommunityInfoGameMode {}

export interface GameInfo {
	playerClass: string;
	opponentClass: string;
	result: 'won' | 'lost' | 'tied';
	additionalResult: string;
	playerRank: string;
}

export interface LeaderboardEntry {
	name: string;
	playerRank: string;
}
