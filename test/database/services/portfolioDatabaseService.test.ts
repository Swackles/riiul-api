import { query } from '../../../src/database/services/databaseService'
import faker from 'faker'
import portfoliosDatabaseService from '../../../src/database/services/portfoliosDatabaseService'

describe('allPortfolios', () => {
	let portfoliosIds: number[] = []

	beforeAll(async () => {
		const newPortfolio = await query<{ id: number }>(
			`INSERT INTO portfolios (subject_id, title, description, priority, active) VALUES
				($1, $2, $3, $4, $5),
				($6, $7, $8, $9, $10) RETURNING id`,
			[
				1, faker.random.word(), faker.random.word(), 'false', 'true',
				1, faker.random.word(), faker.random.word(), 'false', 'false'
			]
		)
		portfoliosIds = newPortfolio.rows.map(({ id }) => id)
	})

	afterAll(async () => {
		await query('DELETE FROM portfolios WHERE id IN ($1, $2)', [portfoliosIds[0], portfoliosIds[1]])
	})

	it('should return all portfolios', async () => {
		const res = await portfoliosDatabaseService.allPortfolios()

		expect(res).not.toBeNull()
		expect(res).toHaveLength(2)
	})
})

describe('allPortfoliosPublic', () => {
	let portfoliosIds: number[] = []

	beforeAll(async () => {
		const newPortfolio = await query<{ id: number }>(
			`INSERT INTO portfolios (subject_id, title, description, priority, active) VALUES
				($1, $2, $3, $4, $5),
				($6, $7, $8, $9, $10),
				($11, $12, $13, $14, $15),
				($16, $17, $18, $19, $20),
				($21, $22, $23, $24, $25) RETURNING id`,
			[
				1, faker.random.word(), faker.random.word(), 'true', 'false',
				1, faker.random.word(), faker.random.word(), 'true', 'true',
				1, faker.random.word(), faker.random.word(), 'false', 'true',
				1, faker.random.word(), faker.random.word(), 'false', 'false',
				1, faker.random.word(), faker.random.word(), 'true', 'true',
			]
		)
		portfoliosIds = newPortfolio.rows.map(({ id }) => id)
	})

	afterAll(async () => {
		await query('DELETE FROM portfolios WHERE id IN ($1, $2, $3, $4, $5)', portfoliosIds.map(id => id))
	})

	it('should return all public portfolios with priority ahead', async () => {
		const res = await portfoliosDatabaseService.allPortfoliosPublic()

		expect(res).not.toBeNull()
		expect(res).toHaveLength(3)
		expect(res[0].priority).toBeTruthy()
		expect(res[1].priority).toBeTruthy()
		expect(res[2].priority).toBeFalsy()
	})
})
