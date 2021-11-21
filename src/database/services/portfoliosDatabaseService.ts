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

export default {
	allPortfolios,
	allPortfoliosPublic
}
