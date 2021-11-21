/* eslint-disable @typescript-eslint/no-explicit-any */
import filesDatabaseService from '../../src/database/services/filesDatabaseService'
import portfoliosDatabaseService from '../../src/database/services/portfoliosDatabaseService'
import {addPortfolio, getPortfolios} from '../../src/services/portfoliosService'
import * as filesService from '../../src/services/filesService'
import User from '../../src/types/User'
import {DateTime} from 'luxon'
import PortfolioPostBody from '../../src/types/PortfolioPostBody'
import faker from 'faker'

const FILE_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

describe('getPortfolios', () => {
	it('should call allPortfolios when user is set', async () => {
		jest.spyOn(portfoliosDatabaseService, 'allPortfolios').mockImplementation(() => [{ id: 1 }] as any)
		jest.spyOn(portfoliosDatabaseService, 'allPortfoliosPublic').mockImplementation(() => [{ id: 2 }] as any)
		jest.spyOn(filesDatabaseService, 'findWithPortfoliosId').mockImplementation(() => [] as any)

		const res = await getPortfolios({id: 1} as User)

		expect(res[0].id).toBe(1)
	})

	it('should call allPortfoliosPublic when user is not set', async () => {
		jest.spyOn(portfoliosDatabaseService, 'allPortfolios').mockImplementation(() => [{ id: 1 }] as any)
		jest.spyOn(portfoliosDatabaseService, 'allPortfoliosPublic').mockImplementation(() => [{ id: 2 }] as any)
		jest.spyOn(filesDatabaseService, 'findWithPortfoliosId').mockImplementation(() => [] as any)

		const res = await getPortfolios()

		expect(res[0].id).toBe(2)
	})
})

describe('addPortfolio', () => {
	it('should save portfolio', async () => {
		jest.spyOn(portfoliosDatabaseService, 'savePortfolio').mockImplementation((data) => (
			{ id: 1, ...data, createdAt: DateTime.now(), updatedAt: DateTime.now() } as any
		))
		jest.spyOn(filesService, 'saveFile').mockImplementation((name) => ({ name } as any))

		const portfolio: PortfolioPostBody = {
			subjectId: 1,
			title: faker.random.word(),
			description: faker.random.words(20),
			tags: faker.random.word(),
			authors: faker.internet.userName(),
			priority: faker.datatype.boolean(),
			active: faker.datatype.boolean(),
			files: [
				{ fileName: 'test', contents: FILE_BASE64 },
				{ fileName: 'test', contents: FILE_BASE64 }
			]
		}
		const res = await addPortfolio(portfolio)

		expect(res.id).toBe(1)
		expect(res.files.length).toBe(2)
		expect(res.files[0]).toBe('test')
		expect(res.files[1]).toBe('test')
	})
})
