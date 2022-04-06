import request from 'supertest'
import app from '../../src/app'
import {generateJwtToken} from '../../src/services/authenticateService'
import { query} from '../../src/database/services/databaseService'
import SubjectDatabaseType from '../../src/database/types/SubjectDatabaseType'
import faker from 'faker'
import PortfolioDatabaseType from '../../src/database/types/PortfolioDatabaseType'

let tags: SubjectDatabaseType[]
let portfolios: PortfolioDatabaseType[]

const tagRawData = [
	[faker.random.word() + '_1'],
	[faker.random.word() + '_2'],
	[faker.random.word() + '_3'],
	[faker.random.word() + '_4'],
]

beforeAll(async () => {
	tags = await Promise.all(tagRawData.map(async (data) => {
		const res = await query<SubjectDatabaseType>(
			'INSERT INTO tags (name) VALUES ($1) RETURNING *',
			data)

		return res.rows[0]
	}))

	const portfolioRawData = [
		[1, faker.random.word(), faker.random.word(), 'false', 'true'],
		[1, faker.random.word(), faker.random.word(), 'false', 'false'],
		[1, faker.random.word(), faker.random.word(), 'false', 'true']
	]

	portfolios = await Promise.all(portfolioRawData.map(async (data) => {
		const res = await query<PortfolioDatabaseType>(
			'INSERT INTO portfolios (subject_id, title, description, priority, active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
			data)

		return res.rows[0]
	}))

	const refData = [
		[tags[0].id, portfolios[0].id],
		[tags[2].id, portfolios[0].id],
		[tags[0].id, portfolios[2].id],
		[tags[3].id, portfolios[1].id],
	]

	await Promise.all(refData.map(async (data) => await query(
		'INSERT INTO tags_in_portfolio (tag_id, portfolio_id) VALUES ($1, $2) RETURNING *',
		data)
	))
})

afterAll(async () => {
	await query(
		'DELETE FROM tags where id = ANY($1::int[])',
		[tags.map(tag => tag.id)]
	)

	await query(
		'DELETE FROM portfolios where id = ANY($1::int[])',
		[portfolios.map(portfolio => portfolio.id)]
	)
})

describe('get all tags', () => {
	it('should respond with all the tags, when logged in', async () => {
		const response = await request(app)
			.get('/tags')
			.set('Authorization', generateJwtToken(1))

		expect(response).toMatchObject({
			statusCode: 200,
			body: tags.sort(({id: a}, {id: b}) => b - a)
				.map(t => t.name)
		})
	})

	it('should respond with public tags, when not logged in', async () => {
		const response = await request(app)
			.get('/tags')

		expect(response).toMatchObject({ statusCode: 200 })

		expect(response.body).not.toContainEqual(tagRawData[1][0])
		expect(response.body).not.toContainEqual(tagRawData[3][0])
	})
})
