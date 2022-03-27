import {begin, query, rollback} from '../../../src/database/services/databaseService'
import faker from 'faker'
import portfoliosDatabaseService from '../../../src/database/services/portfoliosDatabaseService'
import {PoolClient} from 'pg'
import PortfolioDatabaseType from '../../../src/database/types/PortfolioDatabaseType'
import PortfolioUpdateBody from '../../../src/types/PortfolioUpdateBody'
import {DateTime} from 'luxon'

let client: PoolClient
let PUBLIC_PORTFOLIO_ID: number
const PUBLIC_PORTFOLIO_DATA = [
	1,
	faker.random.word(),
	faker.random.words(10) + ' TEXT_TO_FIND' +faker.random.words(1),
	faker.random.word(),
	faker.random.word(),
	false,
	true
]
let PRIVATE_PORTFOLIO_ID: number
const PRIVATE_PORTFOLIO_DATA = [
	2,
	faker.random.words(1) + ' TEXT_TO_FIND',
	faker.random.words(10),
	faker.random.word(),
	faker.random.word(),
	false,
	false
]

beforeEach(async () => {
	client = await begin()

	const publicRes = await query<PortfolioDatabaseType>('INSERT INTO portfolios' +
		'(subject_id, title, description, tags, authors, priority, active)' +
		'VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', PUBLIC_PORTFOLIO_DATA, client)

	const privateRes = await query<PortfolioDatabaseType>('INSERT INTO portfolios' +
		'(subject_id, title, description, tags, authors, priority, active)' +
		'VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', PRIVATE_PORTFOLIO_DATA, client)

	PUBLIC_PORTFOLIO_ID = publicRes.rows[0].id
	PRIVATE_PORTFOLIO_ID = privateRes.rows[0].id

})

afterEach(async () => {
	await rollback(client)
})

describe('findPortfolio', () => {
	it('should find portfolio, when active', async () => {

		const res = await portfoliosDatabaseService.findPortfolio(PUBLIC_PORTFOLIO_ID, client)

		expect(res.createdAt).toBeDefined()
		expect(res.createdAt).toBeDefined()

		expect(res).toMatchObject({
			id: PUBLIC_PORTFOLIO_ID,
			specialityId: PUBLIC_PORTFOLIO_DATA[0],
			title: PUBLIC_PORTFOLIO_DATA[1],
			description: PUBLIC_PORTFOLIO_DATA[2],
			tags: PUBLIC_PORTFOLIO_DATA[3],
			authors: PUBLIC_PORTFOLIO_DATA[4],
			priority: PUBLIC_PORTFOLIO_DATA[5],
			active: PUBLIC_PORTFOLIO_DATA[6],
			videoLink: null,
			graduationYear: null,
		})
	})
	it('should find portfolio, when inactive', async () => {

		const res = await portfoliosDatabaseService.findPortfolio(PRIVATE_PORTFOLIO_ID, client)

		expect(res.createdAt).toBeDefined()
		expect(res.createdAt).toBeDefined()

		expect(res).toMatchObject({
			id: PRIVATE_PORTFOLIO_ID,
			specialityId: PRIVATE_PORTFOLIO_DATA[0],
			title: PRIVATE_PORTFOLIO_DATA[1],
			description: PRIVATE_PORTFOLIO_DATA[2],
			tags: PRIVATE_PORTFOLIO_DATA[3],
			authors: PRIVATE_PORTFOLIO_DATA[4],
			priority: PRIVATE_PORTFOLIO_DATA[5],
			active: PRIVATE_PORTFOLIO_DATA[6],
			videoLink: null,
			graduationYear: null,
		})
	})

	it('should throw error, when portfolio does not exist', async () => {
		await expect(portfoliosDatabaseService.findPortfolio(-1, client))
			.rejects.toThrowError('PORTFOLIO_NOT_FOUND')
	})
})

describe('findPortfolioPublic', () => {
	it('should find portfolio, when active', async () => {

		const res = await portfoliosDatabaseService.findPortfolioPublic(PUBLIC_PORTFOLIO_ID, client)

		expect(res.createdAt).toBeDefined()
		expect(res.createdAt).toBeDefined()

		expect(res).toMatchObject({
			id: PUBLIC_PORTFOLIO_ID,
			specialityId: PUBLIC_PORTFOLIO_DATA[0],
			title: PUBLIC_PORTFOLIO_DATA[1],
			description: PUBLIC_PORTFOLIO_DATA[2],
			tags: PUBLIC_PORTFOLIO_DATA[3],
			authors: PUBLIC_PORTFOLIO_DATA[4],
			priority: PUBLIC_PORTFOLIO_DATA[5],
			active: PUBLIC_PORTFOLIO_DATA[6],
			videoLink: null,
			graduationYear: null,
		})
	})
	it('should throw error, when inactive', async () => {
		await expect(portfoliosDatabaseService.findPortfolioPublic(PRIVATE_PORTFOLIO_ID, client))
			.rejects.toThrowError('PORTFOLIO_NOT_FOUND')
	})

	it('should throw error, when portfolio does not exist', async () => {
		await expect(portfoliosDatabaseService.findPortfolioPublic(-1, client))
			.rejects.toThrowError('PORTFOLIO_NOT_FOUND')
	})
})

describe('allPortfolios', () => {
	it('should return all portfolios', async () => {
		const res = await portfoliosDatabaseService.allPortfolios({}, client)

		expect(res).not.toBeNull()
		expect(res).toHaveLength(2)
	})

	it('should return all portfolios that are active', async () => {
		const res = await portfoliosDatabaseService.allPortfolios({ active: 'true' }, client)

		expect(res).not.toBeNull()
		expect(res).toHaveLength(1)
	})

	it('should return all portfolios with text insides', async () => {
		const res = await portfoliosDatabaseService.allPortfolios({ q: 'TEXT_TO_FIND' }, client)

		expect(res).not.toBeNull()
		expect(res).toHaveLength(2)
	})

	it('should return all portfolios with speciality', async () => {
		const res = await portfoliosDatabaseService.allPortfolios({ speciality: '1' }, client)

		expect(res).not.toBeNull()
		expect(res).toHaveLength(1)
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

describe('deletePortfolio', () => {
	it('should delete portfolio', async () => {
		await portfoliosDatabaseService.deletePortfolio(PUBLIC_PORTFOLIO_ID, client)

		const res = await query<PortfolioDatabaseType>('SELECT * FROM portfolios WHERE id = $1', [PUBLIC_PORTFOLIO_ID], client)
		expect(res.rows).toHaveLength(0)
	})

	it('should throw error, when portfolio does not exist', async () => {
		await expect(portfoliosDatabaseService.deletePortfolio(-1, client))
			.rejects.toThrowError('PORTFOLIO_NOT_FOUND')
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

describe('updatePortfolio', () => {
	it('should update portfolio', async () => {
		const now = DateTime.now()

		const portfolio = {
			id: PUBLIC_PORTFOLIO_ID,
			specialityId: 2,
			title: faker.random.word(),
			description: faker.random.words(20),
			tags: faker.random.word(),
			authors: faker.internet.userName(),
			priority: faker.datatype.boolean(),
			active: faker.datatype.boolean(),
			graduationYear: faker.date.future().getFullYear(),
			videoLink: 'test_video_link'
		}

		const res1 = await portfoliosDatabaseService.updatePortfolio(PUBLIC_PORTFOLIO_ID,
			{...portfolio, subjectId: portfolio.specialityId}, client)

		expect(res1).not.toBeNull()
		expect(res1).toMatchObject(portfolio)

		expect(res1.id).not.toBeNull()
		expect(res1.createdAt).not.toBeNull()
		expect(res1.updatedAt.toMillis()).toBeLessThanOrEqual(now.toMillis())

		const res2 = await query<PortfolioDatabaseType>('SELECT * FROM portfolios WHERE id = $1', [PUBLIC_PORTFOLIO_ID], client)

		expect(res2).not.toBeNull()
		expect(res2.rows[0]).toMatchObject({
			title: portfolio.title,
			description: portfolio.description,
			tags: portfolio.tags,
			authors: portfolio.authors,
			priority: portfolio.priority,
			active: portfolio.active,
			subject_id: portfolio.specialityId,
			graduation_year: portfolio.graduationYear,
			video_link: portfolio.videoLink
		})

		expect(res2.rows[0].created_at).not.toBeNull()
		expect(DateTime.fromJSDate(res2.rows[0].updated_at).toMillis()).toBeLessThanOrEqual(now.toMillis())
	})

	it('should throw error when no fields to update', async () => {
		await expect(portfoliosDatabaseService.updatePortfolio(PUBLIC_PORTFOLIO_ID, { } as PortfolioUpdateBody, client))
			.rejects.toThrowError('NO_FIELDS_TO_UPDATE')
	})

	it('should throw error when portfolio doesn\'t exist', async () => {
		await expect(portfoliosDatabaseService.updatePortfolio(-1, { active: false } as PortfolioUpdateBody, client))
			.rejects.toThrowError('PORTFOLIO_NOT_FOUND')
	})
})
