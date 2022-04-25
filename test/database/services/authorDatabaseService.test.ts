import {begin, query, rollback} from '../../../src/database/services/databaseService'
import AuthorDatabaseType from '../../../src/database/types/AuthorDatabaseType'
import {PoolClient} from 'pg'
import faker from 'faker'
import PortfolioDatabaseType from '../../../src/database/types/PortfolioDatabaseType'
import Author from '../../../src/types/Author'
import authorDatabaseService from '../../../src/database/services/authorDatabaseService'
import pool from '../../../src/database/services/poolService'

let client: PoolClient
let authors: Author[]
let portfoliosIds: number[]

beforeEach(async () => {
	client = await begin()
	const authorRawData = [
		['author_1'],
		['author_2'],
		['author_3'],
		['author_4'],
	]

	authors = (await Promise.all(authorRawData.map(async (data) => {
		const res = await query<AuthorDatabaseType>(
			'INSERT INTO authors (name) VALUES ($1) RETURNING *',
			data, client)

		return res.rows[0]
	}))).map(tag => {
		delete tag.created_at
		delete tag.updated_at

		return tag
	})

	const portfolioRawData = [
		[1, faker.random.word(), faker.random.word(), 'false', 'true'],
		[1, faker.random.word(), faker.random.word(), 'false', 'true'],
		[1, faker.random.word(), faker.random.word(), 'false', 'true']
	]

	const portfolios = await Promise.all(portfolioRawData.map(async (data) => {
		const res = await query<PortfolioDatabaseType>(
			'INSERT INTO portfolios (subject_id, title, description, priority, active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
			data, client)

		return res.rows[0]
	}))

	portfoliosIds = portfolios.map((portfolio) => portfolio.id)

	const refData = [
		[authors[0].id, portfolios[0].id],
		[authors[1].id, portfolios[0].id],
		[authors[3].id, portfolios[2].id]
	]

	await Promise.all(refData.map(async (data) => query(
		'INSERT INTO authors_in_portfolio (author_id, portfolio_id) VALUES ($1, $2) RETURNING *',
		data, client)
	))
})

afterEach(async () => {
	await rollback(client)

	await pool.end()
})

describe('allAuthors', () => {
	it('should return all authors', async () => {
		const keywords = await authorDatabaseService.allAuthors(client)

		expect(keywords).toHaveLength(4)
	})
})

describe('findWithPortfoliosId', () => {
	it('should return all authors with portfolio id', async () => {
		const keywords = await authorDatabaseService.findWithPortfolioId(portfoliosIds[0], client)

		expect(keywords).toHaveLength(2)
		expect(keywords).toMatchObject([ authors[0], authors[1] ])
	})
})

describe('saveAuthor', () => {
	it('should save a author and save it into the reference table', async () => {
		const res = await authorDatabaseService.saveAuthor('SAVE_AUTHOR_1', portfoliosIds[0], client)

		const { rows: authorRows } = await query<AuthorDatabaseType>(
			'SELECT * FROM authors WHERE name = $1',
			['SAVE_AUTHOR_1'],
			client
		)

		const { rows: authorReference } = await query(
			'SELECT * FROM authors_in_portfolio WHERE portfolio_id = $1 AND author_id = $2',
			[portfoliosIds[0], authorRows[0].id],
			client
		)

		delete authorRows[0].created_at
		delete authorRows[0].updated_at

		expect(res).toMatchObject(authorRows[0])

		expect(authorReference).toBeDefined()
		expect(authorReference).toHaveLength(1)
	})

	it('should return existing author if author already exists', async () => {
		await authorDatabaseService.saveAuthor(authors[0].name, portfoliosIds[0], client)

		await expect(authorDatabaseService.saveAuthor(authors[0].name, portfoliosIds[1], client))
			.resolves.toMatchObject(authors[0])
	})

	it('should return existing author if author and portfolio reference already exists', async () => {
		await authorDatabaseService.saveAuthor(authors[0].name, portfoliosIds[0], client)

		await expect(authorDatabaseService.saveAuthor(authors[0].name, portfoliosIds[0], client))
			.resolves.toMatchObject(authors[0])
	})
})
