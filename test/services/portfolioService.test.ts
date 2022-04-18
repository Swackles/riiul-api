import portfoliosDatabaseService from '../../src/database/services/portfoliosDatabaseService'
import {DateTime} from 'luxon'
import filesDatabaseService from '../../src/database/services/filesDatabaseService'
import File from '../../src/types/File'
import User from '../../src/types/User'
import {findPortfolio, getPortfolios} from '../../src/services/portfoliosService'
import tagDatabaseService from '../../src/database/services/tagDatabaseService'
import authorDatabaseService from '../../src/database/services/authorDatabaseService'
import faker from 'faker'
import PortfolioExternalLink from '../../src/types/PortfolioExternalLink'
import PORTFOLIO_EXTERNAL_LINK from '../../src/enums/PORTFOLIO_EXTERNAL_LINK'
import portfolioExternalLinksDatabaseService from '../../src/database/services/portfolioExternalLinksDatabaseService'

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
		graduationYear: faker.date.past().getFullYear(),
	}
]

const MOCK_PORTFOLIO = {
	id: 1,
	specialityId: 1,
	title: 'portfolio-1',
	description: 'Lorem Ipsum',
	priority: false,
	active: true,
	createdAt: DateTime.now(),
	updatedAt: DateTime.now(),
	graduationYear: 2021,
}

const MOCK_FILES = [
	{
		id: 3,
		portfolioId: 1,
		type: 'IMG',
		extension: 'jpg',
		name: 'test-image-1'
	},
	{
		id: 4,
		portfolioId: 1,
		type: 'PDF',
		extension: 'pdf',
		name: 'test-pdf-1'
	},
	{
		id: 5,
		portfolioId: 2,
		type: 'IMG',
		extension: 'jpg',
		name: 'test-image-2'
	},
	{
		id: 6,
		portfolioId: 3,
		type: 'IMG',
		extension: 'jpg',
		name: 'test-image-3'
	}
] as unknown as File[]

const MOCK_EXTERNAL_LINKS = [
	{
		title: faker.random.word(),
		type: PORTFOLIO_EXTERNAL_LINK.EXTERNAL,
		link: faker.internet.url()
	},
	{
		title: faker.random.word(),
		type: PORTFOLIO_EXTERNAL_LINK.YOUTUBE,
		link: faker.internet.url()
	}
] as PortfolioExternalLink[]

describe('findPortfolio', () => {
	let findPortfoliosSpy: jest.SpyInstance
	let findPortfoliosPublicSpy: jest.SpyInstance
	let findFilesWithPortfoliosIdSpy: jest.SpyInstance
	let findTagsWithPortfoliosIdSpy: jest.SpyInstance
	let findAuthorsWithPortfoliosIdSpy: jest.SpyInstance
	let findExternalLinksWithPortfoliosIdSpy: jest.SpyInstance

	beforeEach(async () => {
		findPortfoliosSpy = jest.spyOn(portfoliosDatabaseService, 'findPortfolioWithTitle')
			.mockReturnValue(Promise.resolve(MOCK_PORTFOLIO))
		findPortfoliosPublicSpy = jest.spyOn(portfoliosDatabaseService, 'findPortfolioPublicWithTitle')
			.mockReturnValue(Promise.resolve(MOCK_PORTFOLIO))
		findFilesWithPortfoliosIdSpy = jest.spyOn(filesDatabaseService, 'findWithPortfoliosId')
			.mockReturnValue(Promise.resolve(MOCK_FILES))
		findTagsWithPortfoliosIdSpy = jest.spyOn(tagDatabaseService, 'findWithPortfolioId')
			.mockReturnValue(Promise.resolve([{ id: 1, name: 'test-tag-1' }, { id: 1, name: 'test-tag-1' }]))
		findAuthorsWithPortfoliosIdSpy = jest.spyOn(authorDatabaseService, 'findWithPortfolioId')
			.mockReturnValue(Promise.resolve([{ id: 1, name: 'test-author-1' }, { id: 1, name: 'test-author-1' }]))
		findExternalLinksWithPortfoliosIdSpy = jest.spyOn(portfolioExternalLinksDatabaseService, 'findWithPortfolioId')
			.mockReturnValue(Promise.resolve(MOCK_EXTERNAL_LINKS))
	})

	it('should call findPortfolioWithTitle when user is present', async () => {
		const res = await findPortfolio('portfolio-1', { id: 1 } as User)

		expect(findPortfoliosSpy).toHaveBeenNthCalledWith(1, 'portfolio-1')
		expect(findPortfoliosPublicSpy).not.toHaveBeenCalled()

		expect(findFilesWithPortfoliosIdSpy).toHaveBeenNthCalledWith(1, [1])
		expect(findTagsWithPortfoliosIdSpy).toHaveBeenNthCalledWith(1, 1)
		expect(findAuthorsWithPortfoliosIdSpy).toHaveBeenNthCalledWith(1, 1)
		expect(findExternalLinksWithPortfoliosIdSpy).toHaveBeenNthCalledWith(1, 1)

		expect(res).toEqual({
			id: 1,
			specialityId: 1,
			title: 'portfolio-1',
			description: 'Lorem Ipsum',
			priority: false,
			active: true,
			tags: ['test-tag-1', 'test-tag-1'],
			authors: ['test-author-1', 'test-author-1'],
			images: [{ id:3, name: 'test-image-1.jpg' }, { id: 5, name: 'test-image-2.jpg' }, { id: 6, name: 'test-image-3.jpg' }],
			files: [{ id:4, name: 'test-pdf-1.pdf' }],
			externalLinks: MOCK_EXTERNAL_LINKS,
			graduationYear: 2021,
		})
	})

	it('should call findPortfolioPublicWithTitle when user is not present', async () => {
		const res = await findPortfolio('portfolio-1')

		expect(findPortfoliosSpy).not.toHaveBeenCalled()
		expect(findPortfoliosPublicSpy).toHaveBeenNthCalledWith(1, 'portfolio-1')

		expect(findFilesWithPortfoliosIdSpy).toHaveBeenNthCalledWith(1, [1])
		expect(findTagsWithPortfoliosIdSpy).toHaveBeenNthCalledWith(1, 1)
		expect(findAuthorsWithPortfoliosIdSpy).toHaveBeenNthCalledWith(1, 1)
		expect(findExternalLinksWithPortfoliosIdSpy).toHaveBeenNthCalledWith(1, 1)

		expect(res).toEqual({
			id: 1,
			specialityId: 1,
			title: 'portfolio-1',
			description: 'Lorem Ipsum',
			priority: false,
			tags: ['test-tag-1', 'test-tag-1'],
			authors: ['test-author-1', 'test-author-1'],
			images: [{ id:3, name: 'test-image-1.jpg' }, { id: 5, name: 'test-image-2.jpg' }, { id: 6, name: 'test-image-3.jpg' }],
			files: [{ id:4, name: 'test-pdf-1.pdf' }],
			externalLinks: MOCK_EXTERNAL_LINKS,
			graduationYear: 2021,
		})

	})
})

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
