import { getConnection } from '@firestone-hs/aws-lambda-utils';
import { CommunityInfo, CommunityOverview, RetrieveCommunityInput } from '../model';
import { retrieveCommunitiesOverview } from './community-info';

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
	// TODO: Check if user can retrieve the community info
	const overview: CommunityOverview = (await retrieveCommunitiesOverview([input.communityId]))?.[0];
	const communityInfo = await retrieveCommunityDetails(overview);
	return {
		statusCode: 200,
		headers: headers,
		body: JSON.stringify(communityInfo),
	};
};

const retrieveCommunityDetails = async (overview: CommunityOverview): Promise<CommunityInfo> => {
	const mysql = await getConnection();
	const totalMembersCountQuery = `
		SELECT count(*) as total FROM community_members WHERE communityId = ?
	`;
	const totalMembersCounts: readonly any[] = await mysql.query(totalMembersCountQuery, [overview.id]);
	mysql.end();
	const result: CommunityInfo = {
		...overview,
		numberOfMembers: totalMembersCounts[0]?.total,
	} as CommunityInfo;
	return result;
};
