import { getAllUserIds } from '@firestone-hs/aws-lambda-utils';
import { CommunityInfo, UserInfoInput } from '../model';
import { retrieveJoinedCommunities } from './community-info';

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
	const input: UserInfoInput = JSON.parse(event.body);
	const allUserIds = await getAllUserIds(input.userId);
	const joinedCommunities: readonly CommunityInfo[] = await retrieveJoinedCommunities(allUserIds);

	return {
		statusCode: 200,
		headers: headers,
		body: JSON.stringify(joinedCommunities),
	};
};
