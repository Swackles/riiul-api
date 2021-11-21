import {query} from './databaseService'
import PortfolioDatabaseType from '../types/PortfolioDatabaseType'
import portfolioMapper from '../mappers/portfolioMapper'
import Portfolio from '../../types/Portfolio'
import PortfolioPostBody from '../../types/PortfolioPostBody'

async function allPortfolios(): Promise<Portfolio[]> {
	const res = await query<PortfolioDatabaseType>('SELECT * FROM portfolios',)

	return res.rows.map(portfolioMapper)
}

async function allPortfoliosPublic(): Promise<Portfolio[]> {
	const res = await query<PortfolioDatabaseType>('SELECT * FROM portfolios WHERE active = true order by priority desc')

	return res.rows.map(portfolioMapper)
}

async function deletePortfolio(id: number): Promise<void> {
	await query('DELETE FROM portfolios WHERE id = $1', [id])
}

async function savePortfolio(portfolio: PortfolioPostBody): Promise<Portfolio> {
	const data = [
		portfolio.subjectId,
		portfolio.title,
		portfolio.description,
		portfolio.tags,
		portfolio.authors,
		portfolio.priority,
		portfolio.active
	]
	const res = await query<PortfolioDatabaseType>('INSERT INTO portfolios (subject_id, title, description, tags, authors, priority, active) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', data)

	return portfolioMapper(res.rows[0])
}

export default {
	allPortfolios,
	allPortfoliosPublic,
	deletePortfolio,
	savePortfolio
}
