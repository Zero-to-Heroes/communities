import { retrieveCommunityInfo, sanitizeForOutput } from '../cron/internal/community';
import { RetrieveCommunityInput } from '../model';

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
	const input: RetrieveCommunityInput = JSON.parse(event.body);
	const communityInfo = await retrieveCommunityInfo(input.communityId);
	if (!input.userName?.length || !communityInfo?.members?.includes(input.userName)) {
		console.debug('user not part of community', input.userName, communityInfo?.members, communityInfo);
		return {
			statusCode: 403,
			headers: headers,
			body: JSON.stringify({ error: `User ${input.userName} not part of community ${input.communityId}` }),
		};
	}

	const sanitized = sanitizeForOutput(communityInfo);
	return {
		statusCode: 200,
		headers: headers,
		body: JSON.stringify(sanitized),
	};
};
