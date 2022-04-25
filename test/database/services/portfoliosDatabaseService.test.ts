import {PoolClient} from 'pg'
import {begin, query, rollback} from '../../../src/database/services/databaseService'
import SubjectDatabaseType from '../../../src/database/types/SubjectDatabaseType'
import portfoliosDatabaseService from '../../../src/database/services/portfoliosDatabaseService'
import tagDatabaseService from '../../../src/database/services/tagDatabaseService'
import authorDatabaseService from '../../../src/database/services/authorDatabaseService'
import pool from '../../../src/database/services/poolService'

let client: PoolClient

const ALL_PORTFOLIOS = [
	{
		title: 'Title1',
		subjectId: 2,
		description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus at',
		priority: false,
		active: true,
		tags: ['tag1', 'tag2', 'tag3'],
		authors: ['author1', 'author2', 'author3']
	},
	{
		title: 'Title2',
		subjectId: 3,
		description: 'Title2Lorem ipsum dolor sit amet, consectetur adipisTitle2cing elit. Phasellus at',
		priority: false,
		active: false,
		tags: ['tag2'],
		authors: ['author1', 'author2']
	},
	{
		title: 'Title3',
		subjectId: 2,
		description: 'Lorem ipsum dolor sit amet, coTitle2nsectetur adipiscing elit. Phasellus at',
		priority: false,
		active: false,
		tags: ['tag5', 'tag2'],
		authors: ['author1', 'author3']
	},
	{
		title: 'Title4',
		subjectId: 1,
		description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus at',
		priority: false,
		active: true,
		tags: ['tag1', 'tag3'],
		authors: ['author3']
	},
	{
		title: 'Title5',
		subjectId: 4,
		description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus at',
		priority: false,
		active: true,
		tags: ['tag4', 'tag6'],
		authors: ['author1']
	}
]

beforeAll(async () => {
	client = await begin()

	await Promise.all(ALL_PORTFOLIOS.map(
		async ({title, subjectId, description, priority, active, tags, authors}) => {
			const { rows } = await query<SubjectDatabaseType>(
				'INSERT INTO portfolios (title, subject_id, description, priority, active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
				[title, subjectId, description, priority, active],
				client)

			for (const tag of tags) {
				await tagDatabaseService.saveTag(tag, rows[0].id, client)
			}
			for (const author of authors) {
				await authorDatabaseService.saveAuthor(author, rows[0].id, client)
			}
		}))

})

afterAll(async () => {
	await rollback(client)

	await pool.end()
})

describe('findPortfolioWithTitle', () => {
	it('should return user when searching for an active user', async () => {

		const res = await portfoliosDatabaseService.findPortfolioWithTitle('Title1', client)

		expect(res).toMatchObject({
			title: 'Title1',
			specialityId: 2,
			description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus at',
			priority: false,
			active: true
		})
	})

	it('should return user when searching for an inactive user', async () => {

		const res = await portfoliosDatabaseService.findPortfolioWithTitle('Title2', client)

		expect(res).toMatchObject({
			title: 'Title2',
			specialityId: 3,
			description: 'Title2Lorem ipsum dolor sit amet, consectetur adipisTitle2cing elit. Phasellus at',
			priority: false,
			active: false
		})
	})
})

describe('findPortfolioPublicWithTitle', () => {
	it('should return user when searching for an active user', async () => {

		const res = await portfoliosDatabaseService.findPortfolioPublicWithTitle('Title1', client)

		expect(res).toMatchObject({
			title: 'Title1',
			specialityId: 2,
			description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus at',
			priority: false,
			active: true
		})
	})

	it('should not return user when searching for an inactive user', async () => {

		await expect(portfoliosDatabaseService.findPortfolioPublicWithTitle('Title2', client))
			.rejects.toMatchObject({ status: 404, message: 'PORTFOLIO_NOT_FOUND' })
	})
})

describe('allPortfoliosPublic', () => {
	it('should return all public portfolios', async () => {
		const res = await portfoliosDatabaseService.allPortfoliosPublic(undefined, client)

		expect(res).toHaveLength(3)
	})

	it('should return all active portfolios if params active is set true', async () => {
		const res = await portfoliosDatabaseService.allPortfoliosPublic({active: true}, client)

		expect(res).toHaveLength(3)
	})

	it('should return all active portfolios if params active is set false', async () => {
		const res = await portfoliosDatabaseService.allPortfoliosPublic({active: false}, client)

		expect(res).toHaveLength(3)
	})
})

describe('allPortfolios', () => {
	it('should return all portfolios', async () => {
		const res = await portfoliosDatabaseService.allPortfolios(undefined, client)

		expect(res).toHaveLength(5)
	})

	it('should return all active portfolios if params active is set true', async () => {
		const res = await portfoliosDatabaseService.allPortfolios({active: true}, client)

		expect(res).toHaveLength(3)
	})

	it('should return all not active portfolios if params active is set false', async () => {
		const res = await portfoliosDatabaseService.allPortfolios({active: false}, client)

		expect(res).toHaveLength(2)
	})

	it('should return all active portfolios with specialities "Rakendusinformaatika" and "Tervisejuht"', async () => {
		const res = await portfoliosDatabaseService.allPortfolios({
			active: true,
			specialities: ['Rakendusinformaatika', 'Tervisejuht']
		}, client)

		expect(res).toHaveLength(2)
	})

	it('should return all portfolios with tags "tag1" and "tag2"', async () => {
		const res = await portfoliosDatabaseService.allPortfolios({
			tags: ['tag1', 'tag2']
		}, client)

		expect(res).toHaveLength(4)
	})

	it('should return all portfolios with authors "author1" and "author2"', async () => {
		const res = await portfoliosDatabaseService.allPortfolios({
			authors: ['author1', 'author2']
		}, client)

		expect(res).toHaveLength(4)
	})

	it('should return all portfolios with word', async () => {
		const res = await portfoliosDatabaseService.allPortfolios({
			q:'Title2'
		}, client)

		expect(res).toHaveLength(2)
	})
})
