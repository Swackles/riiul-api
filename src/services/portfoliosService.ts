import PortfolioListResponse from '../types/PortfolioListResponse'
import portfoliosDatabaseService from '../database/services/portfoliosDatabaseService'
import filesDatabaseService from '../database/services/filesDatabaseService'
import User from '../types/User'
import Portfolio from '../types/Portfolio'
import PortfolioPostBody from '../types/PortfolioPostBody'
import PortfolioResponse from '../types/PortfolioResponse'
import {saveFile} from './filesService'

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

export async function addPortfolio(portfolio: PortfolioPostBody): Promise<PortfolioResponse> {
	const newPortfolio = await portfoliosDatabaseService.savePortfolio(portfolio)
	const files = await Promise.all(portfolio.files.map(async (f, i) => {
		const file = await saveFile(f.fileName, f.contents, {id: newPortfolio.id, order: i})
		return file.name
	}))

	return {...newPortfolio, files}
}
