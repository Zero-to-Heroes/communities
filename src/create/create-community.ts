export default async (event): Promise<any> => {
	// const headers = {
	// 	'Access-Control-Allow-Headers':
	// 		'Accept,Accept-Language,Content-Language,Content-Type,Authorization,x-correlation-id,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
	// 	'Access-Control-Expose-Headers': 'x-my-header-out',
	// 	'Access-Control-Allow-Methods': 'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT',
	// 	'Access-Control-Allow-Origin': event.headers?.Origin || event.headers?.origin || '*',
	// };
	// // Preflight
	// if (!event.body) {
	// 	const response = {
	// 		statusCode: 200,
	// 		body: null,
	// 		headers: headers,
	// 	};
	// 	return response;
	// }
	// console.debug('received event', event);
	// const input: CreateCommunityInput = JSON.parse(event.body);
	// const createInDbResult = await createCommunityInDb(input);
	// if (!createInDbResult) {
	// 	const response = {
	// 		statusCode: 400,
	// 		body: null,
	// 		headers: headers,
	// 	};
	// 	return response;
	// }
	// // Add yourself to the members
	// // Create the file that stores the data
	// return {
	// 	statusCode: 200,
	// 	headers: headers,
	// 	body: 'ok',
	// };
};

// async function performJoin(userId: string, code: string): Promise<string | null> {
// 	const communityIdQuery = `
// 		SELECT id FROM communities WHERE joinCode = ?
// 	`;
// 	const mysql = await getConnection();
// 	const result = await mysql.query(communityIdQuery, [code]);
// 	const communityId = result[0]?.id;
// 	if (!communityId) {
// 		console.warn('Could not find community with code', code);
// 		return null;
// 	}

// 	const joinQuery = `
// 		INSERT IGNORE INTO community_members
// 		(communityId, userId)
// 		VALUES (?, ?)
// 	`;
// 	const joinResult: any[] = await mysql.query(joinQuery, [communityId, userId]);
// 	console.debug('joinResult', joinResult);
// 	return 'ok';
// }
