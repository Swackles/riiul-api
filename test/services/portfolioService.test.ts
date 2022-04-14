import portfoliosDatabaseService from '../../src/database/services/portfoliosDatabaseService'
import {DateTime} from 'luxon'
import faker from 'faker'
import filesDatabaseService from '../../src/database/services/filesDatabaseService'
import File from '../../src/types/File'
import User from '../../src/types/User'
import {getPortfolios} from '../../src/services/portfoliosService'

const MOCK_PORTFOLIOS = [
	{
		id: 1,
		specialityId: 1,
		title: faker.random.word(),
		description: faker.random.words(10),
		tags: faker.random.words(10).split(' '),
		authors: faker.random.words(10).split(' '),
		priority: faker.datatype.boolean(),
		active: true,
		createdAt: DateTime.now(),
		updatedAt: DateTime.now(),
		videoLink: faker.random.image(),
		graduationYear: faker.date.past().getFullYear(),
	},
	{
		id: 2,
		specialityId: 2,
		title: faker.random.word(),
		description: faker.random.words(10),
		tags: faker.random.words(10).split(' '),
		authors: faker.random.words(10).split(' '),
		priority: faker.datatype.boolean(),
		active: true,
		createdAt: DateTime.now(),
		updatedAt: DateTime.now(),
		videoLink: faker.random.image(),
		graduationYear: faker.date.past().getFullYear(),
	},
	{
		id: 3,
		specialityId: 1,
		title: faker.random.word(),
		description: faker.random.words(10),
		tags: faker.random.words(10).split(' '),
		authors: faker.random.words(10).split(' '),
		priority: faker.datatype.boolean(),
		active: false,
		createdAt: DateTime.now(),
		updatedAt: DateTime.now(),
		videoLink: faker.random.image(),
		graduationYear: faker.date.past().getFullYear(),
	}
]

const MOCK_FILES = [
	{
		portfolioId: 1,
		type: 'IMG',
		extension: 'jpg',
		name: 'test'
	}
] as unknown as File[]

describe('getPortfolios', () => {
	let allPortfoliosSpy: jest.SpyInstance
	let allPortfoliosPublicSpy: jest.SpyInstance
	let filesFindWithPortfoliosId: jest.SpyInstance

	beforeEach(async () => {
		allPortfoliosSpy = jest.spyOn(portfoliosDatabaseService, 'allPortfolios')
			.mockReturnValue(Promise.resolve(MOCK_PORTFOLIOS))
		allPortfoliosPublicSpy = jest.spyOn(portfoliosDatabaseService, 'allPortfoliosPublic')
			.mockReturnValue(Promise.resolve(MOCK_PORTFOLIOS.filter(portfolio => portfolio.active)))
		filesFindWithPortfoliosId = jest.spyOn(filesDatabaseService, 'findWithPortfoliosId')
			.mockReturnValue(Promise.resolve(MOCK_FILES))

	})

	it('should call allPortfolios when user is present', async () => {
		const query = {
			q: 'test',
			tags: 'tag1,tag2',
			authors: 'author1,author2',
			speciality: 'speciality',
			active: 'true'
		}
		await getPortfolios({ name: 'user name'} as User, query)
		expect(allPortfoliosSpy).toHaveBeenCalled()
	})
})
