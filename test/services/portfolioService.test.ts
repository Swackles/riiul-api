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
		title: 'portfolio-1',
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
		title: 'portfolio-2',
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
		title: 'portfolio-3',
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
		name: 'test-image-1'
	},
	{
		portfolioId: 1,
		type: 'PDF',
		extension: 'pdf',
		name: 'test-pdf-1'
	},
	{
		portfolioId: 2,
		type: 'IMG',
		extension: 'jpg',
		name: 'test-image-2'
	},
	{
		portfolioId: 3,
		type: 'IMG',
		extension: 'jpg',
		name: 'test-image-3'
	}
] as unknown as File[]

describe('getPortfolios', () => {
	let allPortfoliosSpy: jest.SpyInstance
	let allPortfoliosPublicSpy: jest.SpyInstance

	beforeEach(async () => {
		allPortfoliosSpy = jest.spyOn(portfoliosDatabaseService, 'allPortfolios')
			.mockReturnValue(Promise.resolve(MOCK_PORTFOLIOS))
		allPortfoliosPublicSpy = jest.spyOn(portfoliosDatabaseService, 'allPortfoliosPublic')
			.mockReturnValue(Promise.resolve(MOCK_PORTFOLIOS.filter(portfolio => portfolio.active)))
		jest.spyOn(filesDatabaseService, 'findWithPortfoliosId')
			.mockReturnValue(Promise.resolve(MOCK_FILES))

	})

	it('should call allPortfolios when user is present', async () => {
		const res = await getPortfolios({ name: 'user name'} as User)

		expect(allPortfoliosSpy).toHaveBeenCalledTimes(1)
		expect(allPortfoliosPublicSpy).not.toHaveBeenCalled()

		expect(res).toEqual([
			{
				id: 1,
				title: 'portfolio-1',
				specialityId: 1,
				image: 'test-image-1.jpg',
				active: true
			},
			{
				id: 2,
				title: 'portfolio-2',
				specialityId: 2,
				image: 'test-image-2.jpg',
				active: true
			},
			{
				id: 3,
				title: 'portfolio-3',
				specialityId: 1,
				image: 'test-image-3.jpg',
				active: false
			}
		])
	})

	it('should call allPublicPortfolios when user is not present', async () => {
		const res = await getPortfolios(undefined)

		expect(allPortfoliosPublicSpy).toHaveBeenCalledTimes(1)
		expect(allPortfoliosSpy).not.toHaveBeenCalled()

		expect(res).toEqual([
			{
				id: 1,
				title: 'portfolio-1',
				specialityId: 1,
				image: 'test-image-1.jpg'
			},
			{
				id: 2,
				title: 'portfolio-2',
				specialityId: 2,
				image: 'test-image-2.jpg'
			}
		])
	})

	it('should correctly compile the query params', async () => {
		const query = {
			q: 'test',
			tags: 'tag1,tag2',
			authors: 'author1,author2',
			specialities: 'speciality',
			active: 'true'
		}

		await getPortfolios(undefined, query)
		expect(allPortfoliosPublicSpy).toHaveBeenNthCalledWith(1, {
			q: 'test',
			tags: ['tag1', 'tag2'],
			authors: ['author1', 'author2'],
			specialities: ['speciality'],
			active: true
		}, undefined )
	})
})
