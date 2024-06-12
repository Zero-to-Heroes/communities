import { getConnection, getConnectionReadOnly } from '@firestone-hs/aws-lambda-utils';

export const getLatestProcessedId = async (): Promise<number> => {
	const mysql = await getConnectionReadOnly();
	const query = `SELECT value FROM process_tracking WHERE name = 'communities_last_processed_id'`;
	const result = await mysql.query(query);
	mysql.end();
	return result[0]?.value;
};

export const updateLastProcessedId = async (newLastProcessedId: number): Promise<void> => {
	const mysql = await getConnection();
	const query = `UPDATE process_tracking SET value = ? WHERE name = 'communities_last_processed_id'`;
	await mysql.query(query, [newLastProcessedId]);
	mysql.end();
};
