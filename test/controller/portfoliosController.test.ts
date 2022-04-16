import request from 'supertest'
import app from '../../src/app'
import * as faker from 'faker'
import {begin, commit, query, rollback} from '../../src/database/services/databaseService'
import {generateJwtToken} from '../../src/services/authenticateService'
import SubjectDatabaseType from '../../src/database/types/SubjectDatabaseType'
import tagDatabaseService from '../../src/database/services/tagDatabaseService'
import authorDatabaseService from '../../src/database/services/authorDatabaseService'
import {PoolClient} from 'pg'

describe('find one portfolio', () => {
	let client: PoolClient

	const ALL_PORTFOLIOS = [
		{
			title: faker.random.word(),
			specialityId: 2,
			description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus at',
			priority: false,
			active: true,
			tags: ['tag3', 'tag1', 'tag2'],
			authors: ['author3', 'author1', 'author2']
		},
		{
			title: faker.random.word(),
			specialityId: 3,
			description: 'Title2Lorem ipsum dolor sit amet, consectetur adipisTitle2cing elit. Phasellus at',
			priority: false,
			active: false,
			tags: ['tag2'],
			authors: ['author1', 'author2']
		},
		{
			title: faker.random.words(2),
			specialityId: 3,
			description: 'Title2Lorem ipsum dolor sit amet, consectetur adipisTitle2cing elit. Phasellus at',
			priority: false,
			active: false,
			tags: ['tag2'],
			authors: ['author2']
		}
	]

	const portfolioIds: number[] = []
	const tagIds: number[] = []
	const authorIds: number[] = []

	beforeAll(async () => {
		try {
			client = await begin()

			for (const portfolio of ALL_PORTFOLIOS) {
				const {title, specialityId, description, priority, active, tags, authors} = portfolio
				const { rows } = await query<SubjectDatabaseType>(
					'INSERT INTO portfolios (title, subject_id, description, priority, active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
					[title, specialityId, description, priority, active],
					client)

				portfolioIds.push(rows[0].id)

				for (const tag of tags) {
					const {id} = await tagDatabaseService.saveTag(tag, rows[0].id, client)
					tagIds.push(id)
				}
				for (const author of authors) {
					const {id} = await authorDatabaseService.saveAuthor(author, rows[0].id, client)
					authorIds.push(id)
				}
			}

			await commit(client)
		} catch (e) {
			await rollback(client)
			throw e
		}
	})

	afterAll(async () => {
		await query(`DELETE FROM portfolios WHERE id IN (${portfolioIds.join(', ')})`, [])
		await query(`DELETE FROM tags WHERE id IN (${tagIds.join(', ')})`, [])
		await query(`DELETE FROM authors WHERE id IN (${authorIds.join(', ')})`, [])
	})

	it('should return 200 when looking for active portfolio, while logged in', async () => {
		const response = await request(app)
			.get(`/portfolios/${ALL_PORTFOLIOS[1].title}`)
			.set('Authorization', generateJwtToken(1))

		expect(response.statusCode).toBe(200)
		expect(response.body).toMatchObject(ALL_PORTFOLIOS[1])
	})

	it('should return 200 when looking for private portfolio, while logged in', async () => {
		const response = await request(app)
			.get(`/portfolios/${ALL_PORTFOLIOS[1].title}`)
			.set('Authorization', generateJwtToken(1))

		expect(response.statusCode).toBe(200)
		expect(response.body).toMatchObject(ALL_PORTFOLIOS[1])
	})

	it('should return 200 when looking for a active portfolio while not logged in', async () => {
		const response = await request(app)
			.get(`/portfolios/${ALL_PORTFOLIOS[0].title}`)

		delete ALL_PORTFOLIOS[0].active

		expect(response.statusCode).toBe(200)
		expect(response.body).toMatchObject(ALL_PORTFOLIOS[0])
	})

	it('should return 404 when looking for a private portfolio while not logged in', async () => {
		const response = await request(app)
			.get(`/portfolios/${ALL_PORTFOLIOS[1].title}`)

		expect(response.statusCode).toBe(404)
		expect(response.body).toStrictEqual({
			status: 404,
			message: 'PORTFOLIO_NOT_FOUND'
		})
	})

	it('should respond with 404 error when portfolio doesn\'t exist', async () => {
		const response = await request(app)
			.get('/portfolios/not-existing-portfolio')
			.set('Authorization', generateJwtToken(1))

		expect(response.statusCode).toBe(404)
		expect(response.body).toStrictEqual({
			status: 404,
			message: 'PORTFOLIO_NOT_FOUND'
		})
	})
})
