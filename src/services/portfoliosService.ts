import PortfolioListResponse from '../types/PortfolioListResponse'
import portfoliosDatabaseService from '../database/services/portfoliosDatabaseService'
import filesDatabaseService from '../database/services/filesDatabaseService'
import User from '../types/User'
import Portfolio from '../types/Portfolio'
import PortfolioPostBody from '../types/PortfolioPostBody'
import PortfolioResponse from '../types/PortfolioResponse'
import {deleteFile, saveFile, updateFileOrder} from './filesService'
import PortfolioUpdateBody from '../types/PortfolioUpdateBody'
import PortfolioUpdateFileType from '../enums/PortfolioUpdateFileType'
import PortfolioListQuery from '../types/PortfolioListQuery'
import File from '../types/File'
import HttpErrorNotFound from '../errors/HttpErrorNotFound'
import {begin, commit} from '../database/services/databaseService'
import {PoolClient} from 'pg'
import tagDatabaseService from '../database/services/tagDatabaseService'
import authorDatabaseService from '../database/services/authorDatabaseService'

export async function findPortfolio(id: number, user?: User): Promise<PortfolioResponse> {
	let portfolio: Portfolio

	if (user) {
		portfolio = await portfoliosDatabaseService.findPortfolio(id)
	} else {
		portfolio = await portfoliosDatabaseService.findPortfolioPublic(id)
	}

	if (!portfolio) throw new HttpErrorNotFound('PORTFOLIO_NOT_FOUND')
	const filesAndImages = await filesDatabaseService.findWithPortfoliosId([portfolio.id])

	const tags = (await tagDatabaseService.findWithPortfolioId(portfolio.id))
		.map(tag => tag.name)

	const authors = (await authorDatabaseService.findWithPortfolioId(portfolio.id))
		.map(author => author.name)

	function parseFile(file: File) {
		return {
			id: file.id,
			name: file.name + '.' + file.extension,
		}
	}

	return {
		...portfolio,
		tags,
		authors,
		files: filesAndImages.filter(f => f.type === 'PDF').map(parseFile),
		images: filesAndImages.filter(f => f.type === 'IMG').map(parseFile),
	}
}

export async function getPortfolios(user?: User, query?: PortfolioListQuery, client?: PoolClient): Promise<PortfolioListResponse[]> {
	let portfolios: Portfolio[]

	if (user) {
		portfolios = await portfoliosDatabaseService.allPortfolios(query, client)
	} else {
		portfolios = await portfoliosDatabaseService.allPortfoliosPublic(query, client)
	}

	const images = (await filesDatabaseService.findWithPortfoliosId(portfolios.map(p => p.id), client))
		.filter(f => f.type === 'IMG')
		.map(f => ({ id: f.portfolioId, name: f.name + '.' + f.extension} ))

	return portfolios.map(p => {
		const data: PortfolioListResponse = {
			id: p.id,
			title: p.title,
			specialityId: p.specialityId,
			image: images.find(i => i.id === p.id).name,
		}
		if (user) data.active = p.active

		return data
	})
}

export async function getPreviewPortfolios(): Promise<Record<number, PortfolioListResponse[]>> {
	const portfolios = await portfoliosDatabaseService.allPortfoliosPublic()
	const images = (await filesDatabaseService.findWithPortfoliosId(portfolios.map(p => p.id)))
		.filter(f => f.type === 'IMG')
		.map(f => ({ id: f.portfolioId, name: f.name + '.' + f.extension} ))
	const specialities = portfolios.map(p => p.specialityId)
		.filter((s, i, a) => a.indexOf(s) === i)

	const res: Record<number, PortfolioListResponse[]> = {}
	for (const specialityId of specialities) {
		res[specialityId] = portfolios
			.filter(p => p.specialityId === specialityId)
			.map(p => ({
				id: p.id,
				title: p.title,
				specialityId: p.specialityId,
				image: images.find(i => i.id === p.id).name,
			}))
	}

	return res
}

export async function deletePortfolio(id: number): Promise<void> {
	await portfoliosDatabaseService.deletePortfolio(id)
}

export async function addPortfolio(portfolio: PortfolioPostBody): Promise<void> {
	const client = await begin()

	const newPortfolio = await portfoliosDatabaseService.savePortfolio(portfolio, client)

	await Promise.all(portfolio.tags.map(tag => tagDatabaseService.saveTag(tag, newPortfolio.id, client)))

	await Promise.all(portfolio.authors.map(author => authorDatabaseService.saveAuthor(author, newPortfolio.id, client)))

	await Promise.all(portfolio.files.map(async (f, i) => {
		await saveFile(f.name, f.contents, {id: newPortfolio.id, order: i}, client)
	}))

	await Promise.all(portfolio.images.map(async (f, i) => {
		await saveFile(f.name, f.contents, {id: newPortfolio.id, order: i}, client)
	}))

	await commit(client)
}

export async function updatePortfolio(id: number, portfolio: PortfolioUpdateBody): Promise<void> {
	const client = await begin()

	await portfoliosDatabaseService.updatePortfolio(id, portfolio, client)

	await Promise.all(portfolio.tags.map(tag => tagDatabaseService.saveTag(tag, id, client)))

	await Promise.all(portfolio.authors.map(author => authorDatabaseService.saveAuthor(author, id, client)))

	if(portfolio.files) await Promise.all(portfolio.files.map(async f => {
		if (f.type === PortfolioUpdateFileType.DELETE) {
			await deleteFile(f.id, client)
		}
		else if (f.type === PortfolioUpdateFileType.UPDATE) {
			await updateFileOrder(f.id, f.order, client)
		}
		else if (f.type === PortfolioUpdateFileType.NEW) {
			const file = await saveFile(f.name, f.contents, {id, order: f.order}, client)
			return file.name
		}
	}))

	if(portfolio.images) await Promise.all(portfolio.images.map(async (f) => {
		if (f.type === PortfolioUpdateFileType.DELETE) {
			await deleteFile(f.id, client)
		}
		else if (f.type === PortfolioUpdateFileType.UPDATE) {
			await updateFileOrder(f.id, f.order, client)
		}
		else if (f.type === PortfolioUpdateFileType.NEW) {
			const file = await saveFile(f.name, f.contents, {id, order: f.order}, client)
			return file.name
		}
	}))

	await commit(client)
}
