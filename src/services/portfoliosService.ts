import PortfolioListResponse from '../types/PortfolioListResponse'
import portfoliosDatabaseService from '../database/services/portfoliosDatabaseService'
import filesDatabaseService from '../database/services/filesDatabaseService'
import User from '../types/User'
import Portfolio from '../types/Portfolio'

export async function getPortfolios(user?: User): Promise<PortfolioListResponse[]> {
	let portfolios: Portfolio[]

	if (user) {
		portfolios = await portfoliosDatabaseService.allPortfolios()
	} else {
		portfolios = await portfoliosDatabaseService.allPortfoliosPublic()
	}
	const files = await filesDatabaseService.findWithPortfoliosId(portfolios.map(p => p.id))

	return portfolios.map(p => ({
		id: p.id,
		title: p.title,
		specialityId: p.specialityId,
		files: files.filter(f => f.portfolioId === p.id).map(f => f.name),
	}))
}

export async function deletePortfolio(id: number): Promise<void> {
	await portfoliosDatabaseService.deletePortfolio(id)
}
