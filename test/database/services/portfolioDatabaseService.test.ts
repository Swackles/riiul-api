import {begin, query, rollback} from '../../../src/database/services/databaseService'
import faker from 'faker'
import portfoliosDatabaseService from '../../../src/database/services/portfoliosDatabaseService'
import {PoolClient} from 'pg'

describe('allPortfolios', () => {
	let client: PoolClient

	beforeAll(async () => {
		client = await begin()

		await query<{ id: number }>(
			`INSERT INTO portfolios (subject_id, title, description, priority, active) VALUES
				($1, $2, $3, $4, $5),
				($6, $7, $8, $9, $10) RETURNING id`,
			[
				1, faker.random.word(), faker.random.word(), 'false', 'true',
				1, faker.random.word(), faker.random.word(), 'false', 'false'
			], client
		)
	})

	afterAll(async () => {
		await rollback(client)
	})

	it('should return all portfolios', async () => {
		const res = await portfoliosDatabaseService.allPortfolios({}, client)

		expect(res).not.toBeNull()
		expect(res).toHaveLength(2)
	})
})

describe('allPortfoliosPublic', () => {
	let client: PoolClient

	beforeAll(async () => {
		client = await begin()

		await query<{ id: number }>(
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
			], client
		)
	})

	afterAll(async () => {
		await rollback(client)
	})

	it('should return all public portfolios with priority ahead', async () => {
		const res = await portfoliosDatabaseService.allPortfoliosPublic({}, client)

		expect(res).not.toBeNull()
		expect(res).toHaveLength(3)
		expect(res[0].priority).toBeTruthy()
		expect(res[1].priority).toBeTruthy()
		expect(res[2].priority).toBeFalsy()
	})
})

describe('savePortfolio', () => {
	let client: PoolClient

	beforeAll(async () => {
		client = await begin()
	})

	afterAll(async () => {
		await rollback(client)
	})

	it('should return a newly created user', async () => {
		const portfolio = {
			specialityId: 1,
			title: faker.random.word(),
			description: faker.random.words(20),
			tags: faker.random.word(),
			authors: faker.internet.userName(),
			priority: faker.datatype.boolean(),
			active: faker.datatype.boolean(),
			graduationYear: faker.date.future().getFullYear(),
			videoLink: 'test_video_link'
		}

		const res = await portfoliosDatabaseService.savePortfolio({
			...portfolio,
			images: [],
			subjectId: portfolio.specialityId,
			videLink: portfolio.videoLink}, client)

		expect(res).not.toBeNull()
		expect(res).toMatchObject(portfolio)

		expect(res.id).not.toBeNull()
		expect(res.createdAt).not.toBeNull()
		expect(res.updatedAt).not.toBeNull()

	})
})
