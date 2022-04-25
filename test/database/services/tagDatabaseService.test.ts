import {begin, query, rollback} from '../../../src/database/services/databaseService'
import SubjectDatabaseType from '../../../src/database/types/SubjectDatabaseType'
import {PoolClient} from 'pg'
import keywordDatabaseService from '../../../src/database/services/tagDatabaseService'
import faker from 'faker'
import PortfolioDatabaseType from '../../../src/database/types/PortfolioDatabaseType'
import Tag from '../../../src/types/Tag'

let client: PoolClient
let tags: Tag[]
let portfoliosIds: number[]

beforeEach(async () => {
	client = await begin()
	const tagRawData = [
		['keyword_1'],
		['keyword_2'],
		['keyword_3'],
		['keyword_4'],
	]

	tags = (await Promise.all(tagRawData.map(async (data) => {
		const res = await query<SubjectDatabaseType>(
			'INSERT INTO tags (name) VALUES ($1) RETURNING *',
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
		[tags[0].id, portfolios[0].id],
		[tags[1].id, portfolios[0].id],
		[tags[3].id, portfolios[2].id]
	]

	await Promise.all(refData.map(async (data) => query(
		'INSERT INTO tags_in_portfolio (tag_id, portfolio_id) VALUES ($1, $2) RETURNING *',
		data, client)
	))
})

afterEach(async () => {
	await rollback(client)
})

describe('allTags', () => {
	it('should return all tags', async () => {
		const keywords = await keywordDatabaseService.allTags(client)

		expect(keywords).toHaveLength(4)
	})
})

describe('findWithPortfoliosId', () => {
	it('should return all tags with portfolio id', async () => {
		const keywords = await keywordDatabaseService.findWithPortfolioId(portfoliosIds[0], client)

		expect(keywords).toHaveLength(2)
		expect(keywords).toMatchObject([ tags[0], tags[1] ])
	})
})

describe('saveTag', () => {
	it('should save a tag and save it into the reference table', async () => {
		const res = await keywordDatabaseService.saveTag('SAVE_KEYWORD_1', portfoliosIds[0], client)

		const { rows: tagsRows } = await query<SubjectDatabaseType>(
			'SELECT * FROM tags WHERE name = $1',
			['SAVE_KEYWORD_1'],
			client
		)

		const { rows: tagsReference } = await query(
			'SELECT * FROM tags_in_portfolio WHERE portfolio_id = $1 AND tag_id = $2',
			[portfoliosIds[0], tagsRows[0].id],
			client
		)

		delete tagsRows[0].created_at
		delete tagsRows[0].updated_at

		expect(res).toMatchObject(tagsRows[0])

		expect(tagsReference).toBeDefined()
		expect(tagsReference).toHaveLength(1)
	})

	it('should return existing tag if tag already exists', async () => {
		await keywordDatabaseService.saveTag(tags[0].name, portfoliosIds[0], client)

		await expect(keywordDatabaseService.saveTag(tags[0].name, portfoliosIds[1], client))
			.resolves.toMatchObject(tags[0])
	})

	it('should return existing tag if tag and tag, portfolio reference already exists', async () => {
		await keywordDatabaseService.saveTag(tags[0].name, portfoliosIds[0], client)

		await expect(keywordDatabaseService.saveTag(tags[0].name, portfoliosIds[0], client))
			.resolves.toMatchObject(tags[0])
	})
})
