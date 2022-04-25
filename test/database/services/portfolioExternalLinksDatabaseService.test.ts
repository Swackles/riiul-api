import {begin, query, rollback} from '../../../src/database/services/databaseService'
import {PoolClient} from 'pg'
import faker from 'faker'
import PortfolioDatabaseType from '../../../src/database/types/PortfolioDatabaseType'
import portfolioExternalLinksDatabaseService from '../../../src/database/services/portfolioExternalLinksDatabaseService'
import PortfolioExternalLink from '../../../src/types/PortfolioExternalLink'
import PortfolioExternalLinkDatabaseType from '../../../src/database/types/PortfolioExternalLinkDatabaseType'
import PORTFOLIO_EXTERNAL_LINK from '../../../src/enums/PORTFOLIO_EXTERNAL_LINK'

let client: PoolClient
let externalLinks: (PortfolioExternalLink)[]
let portfoliosIds: number[]

beforeEach(async () => {
	client = await begin()

	const portfoliosData = [
		1, faker.random.word(), faker.random.word(), false, true,
		1, faker.random.word(), faker.random.word(), false, true
	]

	const { rows: portfolios } = await query<PortfolioDatabaseType>(
		'INSERT INTO portfolios (subject_id, title, description, priority, active) VALUES ($1, $2, $3, $4, $5), ($6, $7, $8, $9, $10) RETURNING *',
		portfoliosData,
		client)

	portfoliosIds = portfolios.map(x => x.id)

	const externalLinksData = [
		faker.random.word(), 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', PORTFOLIO_EXTERNAL_LINK.YOUTUBE, portfoliosIds[0],
		faker.random.word(), faker.internet.url(), PORTFOLIO_EXTERNAL_LINK.EXTERNAL, portfoliosIds[0],
		faker.random.word(), faker.internet.url(), PORTFOLIO_EXTERNAL_LINK.EXTERNAL, portfoliosIds[1]
	]

	const { rows: externalLinksDatabase } = await query<PortfolioExternalLinkDatabaseType>(
		`INSERT INTO portfolio_external_links (title, link, type, portfolio_id) VALUES
        	($1, $2, $3, $4),
			($5, $6, $7, $8),
            ($9, $10, $11, $12)
            RETURNING *`,
		externalLinksData, client)

	externalLinks = externalLinksDatabase.map(x => ({
		id: x.id,
		title: x.title,
		link: x.link,
		type: x.type
	}))
})

afterEach(async () => {
	await rollback(client)
})

it('should delete external links, when deleting portfolio', async () => {
	await query('DELETE FROM portfolios WHERE id = $1', [portfoliosIds[0]], client)

	const links = await portfolioExternalLinksDatabaseService
		.findWithPortfolioId(portfoliosIds[0], client)

	expect(links).toHaveLength(0)
})

describe('findWithPortfoliosId', () => {
	it('should return all portfolio external links with portfolio id', async () => {
		const links = await portfolioExternalLinksDatabaseService
			.findWithPortfolioId(portfoliosIds[0], client)

		expect(links).toHaveLength(2)
		expect(links).toEqual([ externalLinks[0], externalLinks[1] ])
	})
})

describe('deletePortfolioExternalLinks', () => {
	it('should delete all portfolio external links', async () => {
		await portfolioExternalLinksDatabaseService
			.deletePortfolioExternalLink(externalLinks[2].id, client)

		const links = await portfolioExternalLinksDatabaseService
			.findWithPortfolioId(portfoliosIds[1], client)

		expect(links).toHaveLength(0)
	})
})

describe('savePortfolioExternalLinks', () => {
	it('should save all portfolio external links', async () => {
		const link = {
			title: faker.random.word(),
			link: faker.internet.url(),
			type: PORTFOLIO_EXTERNAL_LINK.YOUTUBE
		}

		const savedLink = await portfolioExternalLinksDatabaseService
			.savePortfolioExternalLink(portfoliosIds[1], link, client)

		expect(savedLink).toMatchObject(link)

		const links = await portfolioExternalLinksDatabaseService
			.findWithPortfolioId(portfoliosIds[1], client)

		expect(links).toHaveLength(2)
		expect(links).toEqual([externalLinks[2], savedLink])
	})

	it('should overwrite existing external link, if link with type for portfolio already exists', async () => {
		const link = {
			title: faker.random.word(),
			link: faker.internet.url(),
			type: PORTFOLIO_EXTERNAL_LINK.EXTERNAL
		}

		const savedLink = await portfolioExternalLinksDatabaseService
			.savePortfolioExternalLink(portfoliosIds[1], link, client)

		expect(savedLink).toMatchObject(link)

		const links = await portfolioExternalLinksDatabaseService
			.findWithPortfolioId(portfoliosIds[1], client)

		expect(links).toHaveLength(1)
		expect(links).toEqual([savedLink])
	})
})
