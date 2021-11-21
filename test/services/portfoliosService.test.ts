/* eslint-disable @typescript-eslint/no-explicit-any */
import filesDatabaseService from '../../src/database/services/filesDatabaseService'
import portfoliosDatabaseService from '../../src/database/services/portfoliosDatabaseService'
import {getPortfolios} from '../../src/services/portfoliosService'
import User from '../../src/types/User'

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
