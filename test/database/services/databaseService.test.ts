import { query } from '../../../src/database/services/databaseService'
import pool from '../../../src/database/services/poolService'

describe('when no client provided', () => {
	it('should preform query', async () => {
		const res = await query('SELECT * FROM pg_stat_activity', [])

		expect(res).not.toBeNull()
	})
})
describe('when client provided', () => {
	it('should preform query', async () => {
		const res = await query('SELECT * FROM pg_stat_activity', [], await pool.connect())

		expect(res).not.toBeNull()
	})
})
