import {PoolClient, QueryResult} from 'pg'
import pool from './poolService'

export type ReturnType<T> = Promise<QueryResult<T>>

export async function query<T>(query: string, params?: (string|number|boolean|number[]|string[]|boolean[])[], client: PoolClient = undefined): ReturnType<T> {
	const doesClientNotExist = !client
	if(doesClientNotExist) client = await pool.connect()

	const res = await client.query(query, params)

	if (doesClientNotExist) client.release()

	return res
}
