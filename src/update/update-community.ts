import { retrieveCommunityInfo, saveCommunityInfo } from '../cron/internal/community';
import { CommunityInfo, UpdateCommunityInput } from '../model';
import { Mutable } from '../utils';

export default async (event): Promise<any> => {
	const headers = {
		'Access-Control-Allow-Headers':
			'Accept,Accept-Language,Content-Language,Content-Type,Authorization,x-correlation-id,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
		'Access-Control-Expose-Headers': 'x-my-header-out',
		'Access-Control-Allow-Methods': 'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT',
		'Access-Control-Allow-Origin': event.headers?.Origin || event.headers?.origin || '*',
	};

	// Preflight
	// if (!event.body) {
	// 	const response = {
	// 		statusCode: 200,
	// 		body: null,
	// 		headers: headers,
	// 	};
	// 	return response;
	// }

	// TODO: add token validation
	console.debug('received event', event);
	// const input: UpdateCommunityInput = JSON.parse(event.body);
	const input: UpdateCommunityInput = {
		communityId: '',
		userName: '',
		defaultTab: 'arena',
	};

	const communityInfo = await retrieveCommunityInfo(input.communityId);
	if (
		!input.userName?.length ||
		(communityInfo.adminUserName && communityInfo.adminUserName !== input.userName) ||
		(communityInfo.members.length && communityInfo.members[0] !== input.userName)
	) {
		console.debug(
			'user not part of community',
			input.userName,
			communityInfo?.members,
			communityInfo.adminUserName,
		);
		return {
			statusCode: 403,
			headers: headers,
			body: JSON.stringify({ error: `User ${input.userName} not admin of community ${input.communityId}` }),
		};
	}

	const newCommunityInfo: Mutable<CommunityInfo> = { ...communityInfo };
	newCommunityInfo.adminUserName = input.userName;
	if (input.defaultTab) {
		newCommunityInfo.defaultTab = input.defaultTab;
	}
	await saveCommunityInfo(newCommunityInfo);

	return {
		statusCode: 200,
		headers: headers,
		body: JSON.stringify(communityInfo),
	};
};
