/* eslint-disable @typescript-eslint/no-empty-interface */
export interface UserInfoInput {
	userName: string;
}

export interface JoinCommunityInput extends UserInfoInput {
	code: string;
	// Optional for now, will become mandatory once everyone has migrated
	communityId?: string;
}

export interface LeaveCommunityInput extends UserInfoInput {
	communityId: string;
}

export interface CreateCommunityInput {
	adminUserName: string;
	name: string;
	description: string;
	joinCode: string;
	defaultTab?: string;
}

export interface UpdateCommunityInput {
	communityId: string;
	userName: string;
	defaultTab?: string;
	description?: string;
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
	adminUserName: string;
	numberOfMembers: number;
	members: string[];
	memberBattleTags: string[];
	standardInfo: CommunityInfoConstructed;
	wildInfo: CommunityInfoConstructed;
	twistInfo: CommunityInfoConstructed;
	battlegroundsInfo: CommunityInfoBattlegrounds;
	battlegroundsDuoInfo: CommunityInfoBattlegrounds;
	arenaInfo: CommunityInfoArena;
	friendlyBattles: CommunityFriendlyBattles;

	totalGamesPlayed: number;
	totalTimePlayed: number;
	gamesInLastSevenDays?: number;

	defaultTab?: string;
}

export interface CommunityInfoGameMode {
	leaderboard: readonly LeaderboardEntry[];
	gamesPerHour: { [hour: string]: number };
	gamesInLastSevenDays?: number;
	// openSkill: OpenSkill;
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

export interface CommunityFriendlyBattles {
	battles: readonly FriendlyBattle[];
	battlesPerDay: { [day: string]: readonly FriendlyBattle[] };
	openSkill: OpenSkill;
}

export interface FriendlyBattle {
	readonly gameMode: string;
	readonly gameFormat: string;
	readonly players: readonly FriendlyBattlePlayer[];
	readonly winnerIndex: number | 'tie';
	readonly creationDate: Date;
}

export interface FriendlyBattlePlayer {
	readonly name: string;
	readonly heroCardId: string;
	readonly rank: string;
}

export interface GlobalOpenSkill {
	readonly standard: OpenSkill;
	readonly wild: OpenSkill;
	readonly battlegrounds: OpenSkill;
	readonly battlegroundsDuo: OpenSkill;
	readonly arena: OpenSkill;
}

export interface OpenSkill {
	readonly standard: { [battleTag: string]: OpenSkillRating };
	readonly wild: { [battleTag: string]: OpenSkillRating };
	readonly twist: { [battleTag: string]: OpenSkillRating };
	readonly global: { [battleTag: string]: OpenSkillRating };
}

export interface OpenSkillRating {
	mu: number;
	sigma: number;
	ordinal?: number;
	totalGames: number;
}

export const OPEN_SKILL_MEAN = 1200;
export const OPEN_SKILL_DEVIATION = 400;
