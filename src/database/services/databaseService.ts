import {DatabaseError, PoolClient, QueryResult} from 'pg'
import pool from './poolService'
import HttpErrorBadRequest from '../../errors/HttpErrorBadRequest'

export type ReturnType<T> = Promise<QueryResult<T>>

export async function begin(): Promise<PoolClient> {
	const client = await pool.connect()
	await client.query('BEGIN')

	return client
}

export async function commit(client: PoolClient): Promise<void> {
	await client.query('COMMIT')
	client.release()
}

export async function rollback(client: PoolClient): Promise<void> {
	await client.query('ROLLBACK')
	client.release()
}

export async function query<T>(query: string, params?: (string|number|boolean|number[]|string[]|boolean[])[], client?: PoolClient): ReturnType<T> {
	const doesClientNotExist = !client
	if(doesClientNotExist) client = await begin()

	try {
		const res = await client.query(query, params)

		if (doesClientNotExist) await commit(client)

		return res
	} catch (e) {
		await rollback(client)

		if ((e as DatabaseError).message.includes('violates not-null constraint')) {
			throw new HttpErrorBadRequest(`${(e as DatabaseError).column.toUpperCase()}_IS_REQUIRED`, e)
		} else if ((e as DatabaseError).message.includes('duplicate key value violates unique constraint')) {
			const field = (e as DatabaseError).detail.match(/Key \((.*?)\)/)
			throw new HttpErrorBadRequest(`${field[1].toUpperCase()}_ALREADY_EXISTS`, e)
		}

		throw e
	}

}
