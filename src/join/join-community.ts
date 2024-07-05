import { getConnection } from '@firestone-hs/aws-lambda-utils';
import { retrieveCommunityInfo, sanitizeForOutput, saveCommunityInfo } from '../cron/internal/community';
import { CommunityInfo, JoinCommunityInput } from '../model';

export default async (event): Promise<any> => {
	const headers = {
		'Access-Control-Allow-Headers':
			'Accept,Accept-Language,Content-Language,Content-Type,Authorization,x-correlation-id,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
		'Access-Control-Expose-Headers': 'x-my-header-out',
		'Access-Control-Allow-Methods': 'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT',
		'Access-Control-Allow-Origin': event.headers?.Origin || event.headers?.origin || '*',
	};
	// Preflight
	if (!event.body) {
		const response = {
			statusCode: 200,
			body: null,
			headers: headers,
		};
		return response;
	}

	console.debug('received event', event);
	const input: JoinCommunityInput = JSON.parse(event.body);
	if (!input.userName || !input.code) {
		console.log('missing required data');
		return {
			statusCode: 400,
			headers: headers,
			body: JSON.stringify({ error: 'Missing userName or code' }),
		};
	}

	const community = await performJoin(input.userName.trim(), input.code.trim(), input.communityId?.trim());
	console.debug('joinResult', community, input);
	if (!community) {
		const response = {
			statusCode: 400,
			body: null,
			headers: headers,
		};
		return response;
	}

	return {
		statusCode: 200,
		headers: headers,
		body: JSON.stringify(community),
	};
};

const performJoin = async (
	userName: string,
	code: string,
	inputCommunityId?: string,
): Promise<CommunityInfo | null> => {
	const mysql = await getConnection();
	let communityId = null;
	// Legacy
	if (!inputCommunityId) {
		const communityIdQuery = `
			SELECT communityId FROM communities WHERE joinCode = ?
		`;
		const result = await mysql.query(communityIdQuery, [code]);
		communityId = result[0]?.communityId;
		if (!communityId) {
			mysql.end();
			console.warn('Could not find community with code', code);
			return null;
		}
	} else {
		const communityIdQuery = `
			SELECT communityId FROM communities WHERE joinCode = ? AND communityId = ?
		`;
		const result = await mysql.query(communityIdQuery, [code, inputCommunityId]);
		communityId = result[0]?.communityId;
		if (!communityId) {
			mysql.end();
			console.warn('Could not find community with code', code, inputCommunityId);
			return null;
		}
	}

	const joinQuery = `
		INSERT IGNORE INTO community_members 
		(communityId, userName)
		VALUES (?, ?)
	`;
	const joinResult: any[] = await mysql.query(joinQuery, [communityId, userName]);
	console.debug('joinResult', joinResult);
	mysql.end();
	const communityInfo: CommunityInfo = await retrieveCommunityInfo(communityId);
	const members = communityInfo.members || [];
	members.push(userName);
	communityInfo.members = [...new Set(members)];
	await saveCommunityInfo(communityInfo);
	return sanitizeForOutput(communityInfo);
};
