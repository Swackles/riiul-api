import {query} from './databaseService'
import PortfolioDatabaseType from '../types/PortfolioDatabaseType'
import portfolioMapper from '../mappers/portfolioMapper'
import Portfolio from '../../types/Portfolio'

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

export default {
	allPortfolios,
	allPortfoliosPublic,
	deletePortfolio
}
