import {query} from './databaseService'
import {PoolClient} from 'pg'
import PortfolioExternalLink from '../../types/PortfolioExternalLink'
import portfolioExternalLinksMapper from '../mappers/portfolioExternalLinksMapper'
import PortfolioExternalLinkDatabaseType from '../types/PortfolioExternalLinkDatabaseType'
import PortfolioExternalLinkSave from '../../types/PortfolioExternalLinkSave'

async function findWithPortfolioId(portfoliosId: number, client?: PoolClient): Promise<PortfolioExternalLink[]> {
	const res = await query<PortfolioExternalLinkDatabaseType>(
		'SELECT pel.* FROM portfolio_external_links as pel WHERE pel.portfolio_id IN ($1)',
		[portfoliosId],
		client
	)

	return res.rows.map(portfolioExternalLinksMapper)
}

async function deletePortfolioExternalLink(id: number, client?: PoolClient): Promise<void> {
	await query('DELETE FROM portfolio_external_links WHERE id = $1', [id], client)
}

async function savePortfolioExternalLink(portfolioId: number, {title, link, type}: PortfolioExternalLinkSave, client?: PoolClient): Promise<PortfolioExternalLink> {
	const res = await query<PortfolioExternalLinkDatabaseType>(
		`INSERT INTO portfolio_external_links (title, link, type, portfolio_id) VALUES ($1, $2, $3, $4)
		ON CONFLICT ON CONSTRAINT portfolio_external_links_uniq_portfolio_id_type
		DO UPDATE set title = $1, link = $2 RETURNING *`,
		[title, link, type, portfolioId],
		client)

	return portfolioExternalLinksMapper(res.rows[0])
}

export default {
	findWithPortfolioId,
	deletePortfolioExternalLink,
	savePortfolioExternalLink
}
