import { S3 } from '@firestone-hs/aws-lambda-utils';
import { ordinal, rate, rating } from 'openskill';
import { GlobalOpenSkill, OpenSkill } from '../../model';
import { InternalReplaySummaryDbRow } from './replay-summary';

const OPEN_SKILL_BUCKET = 'static.zerotoheroes.com';
const OPEN_SKILL_KEY = `api/communities/open-skill.json`;

const s3 = new S3();

const DEFAULT_MU = 1200;
const DEFAULT_SIGMA = 400;

export const retrieveGlobalOpenSkill = async (): Promise<GlobalOpenSkill> => {
	const infoStr = await s3.readContentAsString(OPEN_SKILL_BUCKET, OPEN_SKILL_KEY);
	return JSON.parse(infoStr);
};

export const updateGlobalOpenSkill = async (globalOpenSkill: GlobalOpenSkill): Promise<void> => {
	await s3.writeFile(globalOpenSkill, OPEN_SKILL_BUCKET, OPEN_SKILL_KEY);
};

export const buildNewOpenSkill = (openSkill: OpenSkill, games: readonly InternalReplaySummaryDbRow[]): OpenSkill => {
	if (!openSkill?.ratings) {
		openSkill = {
			ratings: {},
		};
	}
	for (const game of games) {
		openSkill = updateOpenSkill(openSkill, game);
	}
	return openSkill;
};

const updateOpenSkill = (openSkill: OpenSkill, game: InternalReplaySummaryDbRow): OpenSkill => {
	const player1 = game.playerName;
	let player1Rating = openSkill.ratings[player1];
	if (!player1Rating) {
		player1Rating = {
			mu: DEFAULT_MU,
			sigma: DEFAULT_SIGMA,
			totalGames: 0,
			ordinal: 0,
		};
		openSkill.ratings[player1] = player1Rating;
	}

	const player2 = game.opponentName;
	let player2Rating = openSkill.ratings[player2];
	if (!player2Rating) {
		player2Rating = {
			mu: DEFAULT_MU,
			sigma: DEFAULT_SIGMA,
			totalGames: 0,
			ordinal: 0,
		};
		openSkill.ratings[player2] = player2Rating;
	}

	const ranks = game.result === 'won' ? [1, 2] : game.result === 'lost' ? [2, 1] : [1, 1];
	const [player1RatingAfter, player2RatingAfter] = rate([[rating(player1Rating)], [rating(player2Rating)]], {
		rank: ranks,
	});

	player1Rating.mu = player1RatingAfter[0].mu;
	player1Rating.sigma = player1RatingAfter[0].sigma;
	player1Rating.ordinal = ordinal(player1Rating);
	player1Rating.totalGames++;

	player2Rating.mu = player2RatingAfter[0].mu;
	player2Rating.sigma = player2RatingAfter[0].sigma;
	player2Rating.ordinal = ordinal(player2Rating);
	player2Rating.totalGames++;

	return openSkill;
};
