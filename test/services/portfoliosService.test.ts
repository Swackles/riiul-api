/* eslint-disable @typescript-eslint/no-explicit-any */
import portfoliosDatabaseService from '../../src/database/services/portfoliosDatabaseService'
import {getPortfolios} from '../../src/services/portfoliosService'
import User from '../../src/types/User'
import {begin, rollback} from '../../src/database/services/databaseService'
import {PoolClient} from 'pg'
import {saveFile} from '../../src/services/filesService'

const FILE_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

describe('getPortfolios', () => {
	let client: PoolClient

	beforeAll(async () => {
		client = await begin()

		const { id: PORTFOLIO_ACTIVE_ID } = await portfoliosDatabaseService.savePortfolio({
			title: 'getPortfolios_Portfolio_1',
			subjectId: 1,
			description: 'Description 1',
			tags: 'tag1,tag2',
			authors: 'author1,author2',
			priority: false,
			active: true,
			images: [],
			files: [],
			videLink: 'video link',
			graduationYear: 2020
		}, client)

		await saveFile('image1.jpg', FILE_BASE64, {id: PORTFOLIO_ACTIVE_ID, order: 1}, client)
		await saveFile('file1.pdf', FILE_BASE64, {id: PORTFOLIO_ACTIVE_ID, order: 1}, client)

		const { id: PORTFOLIO_INACTIVE_ID } = await portfoliosDatabaseService.savePortfolio({
			title: 'getPortfolios_Portfolio_2',
			subjectId: 1,
			description: 'Description 1',
			tags: 'tag1,tag2',
			authors: 'author1,author2',
			priority: false,
			active: false,
			images: [{ name: 'image1.jpg', contents: FILE_BASE64 }],
			files: [{ name: 'file1.pdf', contents: FILE_BASE64 }],
			videLink: 'video link',
			graduationYear: 2020
		}, client)

		await saveFile('image1.jpg', FILE_BASE64, {id: PORTFOLIO_INACTIVE_ID, order: 1}, client)
		await saveFile('file1.pdf', FILE_BASE64, {id: PORTFOLIO_INACTIVE_ID, order: 1}, client)
	})

	afterAll(async () => {
		await rollback(client)
	})

	it('should call allPortfolios when user is set', async () => {
		const res = await getPortfolios({id: 1} as User, undefined, client)

		expect(res.filter(x => x.title.includes('getPortfolios')).length).toBe(2)
	})

	it('should call allPortfoliosPublic when user is not set', async () => {
		const res = await getPortfolios(undefined, undefined, client)

		expect(res.filter(x => x.title.includes('getPortfolios')).length).toBe(1)
	})
})
