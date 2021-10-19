import { query } from '../databaseService'
import pool from '../poolService'

describe('databaseService', () => {
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
})
