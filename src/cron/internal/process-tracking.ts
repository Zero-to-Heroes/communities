import { ServerlessMysql } from 'serverless-mysql';

export const getLatestProcessedId = async (mysql: ServerlessMysql): Promise<number> => {
	const query = `SELECT value FROM process_tracking WHERE name = 'communities_last_processed_id'`;
	const result = await mysql.query(query);
	return result[0]?.value;
};

export const updateLastProcessedId = async (mysql: ServerlessMysql, newLastProcessedId: number): Promise<void> => {
	const query = `UPDATE process_tracking SET value = ? WHERE name = 'communities_last_processed_id'`;
	await mysql.query(query, [newLastProcessedId]);
};
