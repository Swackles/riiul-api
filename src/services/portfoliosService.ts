import PortfolioListResponse from '../types/PortfolioListResponse'
import portfoliosDatabaseService from '../database/services/portfoliosDatabaseService'
import filesDatabaseService from '../database/services/filesDatabaseService'
import User from '../types/User'
import Portfolio from '../types/Portfolio'
import PortfolioPostBody from '../types/PortfolioPostBody'
import PortfolioResponse from '../types/PortfolioResponse'
import {deleteFile, saveFile, updateFileOrder} from './filesService'
import PortfolioUpdateBody, {ModifyPortfolioAddons} from '../types/PortfolioUpdateBody'
import FORM_MODIFiCATION_TYPE from '../enums/FORM_MODIFiCATION_TYPE'
import PortfolioListQuery from '../types/PortfolioListQuery'
import File from '../types/File'
import {begin, commit} from '../database/services/databaseService'
import {PoolClient} from 'pg'
import tagDatabaseService from '../database/services/tagDatabaseService'
import authorDatabaseService from '../database/services/authorDatabaseService'
import PortfolioQueryType from '../database/types/PortfolioQueryType'
import portfolioExternalLinksDatabaseService from '../database/services/portfolioExternalLinksDatabaseService'
import MODIFICATION_ORDER from '../enums/MODIFICATION_ORDER'

export async function findPortfolio(title: string, user?: User): Promise<PortfolioResponse> {
	let portfolio: Portfolio

	if (user) {
		portfolio = await portfoliosDatabaseService.findPortfolioWithTitle(title)
	} else {
		portfolio = await portfoliosDatabaseService.findPortfolioPublicWithTitle(title)
	}

	const filesAndImages = await filesDatabaseService.findWithPortfoliosId([portfolio.id])

	const tags = (await tagDatabaseService.findWithPortfolioId(portfolio.id))
		.map(tag => tag.name)

	const authors = (await authorDatabaseService.findWithPortfolioId(portfolio.id))
		.map(author => author.name)

	const externalLinks = await portfolioExternalLinksDatabaseService.findWithPortfolioId(portfolio.id)

	function parseFile(file: File) {
		return {
			id: file.id,
			name: file.name + '.' + file.extension,
		}
	}

	delete portfolio.createdAt
	delete portfolio.updatedAt

	if (!user) delete portfolio.active

	return {
		...portfolio,
		externalLinks,
		tags,
		authors,
		files: filesAndImages.filter(f => f.type === 'PDF').map(parseFile),
		images: filesAndImages.filter(f => f.type === 'IMG').map(parseFile),
	}
}

export async function getPortfolios(user?: User, query?: PortfolioListQuery, client?: PoolClient): Promise<PortfolioListResponse[]> {
	let portfolios: Portfolio[]
	const dataBaseQuery: PortfolioQueryType = {
		q: query?.q,
		tags: query?.tags ? query.tags.split(',') : undefined,
		specialities: query?.specialities ? query.specialities.split(',') : undefined,
		authors: query?.authors ? query.authors.split(',') : undefined,
		active: query?.active ? query.active === 'true' : undefined,
	}

	if (user) {
		portfolios = await portfoliosDatabaseService.allPortfolios(dataBaseQuery, client)
	} else {
		portfolios = await portfoliosDatabaseService.allPortfoliosPublic(dataBaseQuery, client)
	}

	const images = (await filesDatabaseService.findWithPortfoliosId(portfolios.map(p => p.id), client))
		.filter(f => f.type === 'IMG')
		.map(f => ({ id: f.portfolioId, name: f.name + '.' + f.extension} ))

	return portfolios.map(p => {
		const data: PortfolioListResponse = {
			id: p.id,
			title: p.title,
			specialityId: p.specialityId,
			image: images?.find(i => i.id === p.id)?.name,
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

	await Promise.all(portfolio.externalLinks.map(link => portfolioExternalLinksDatabaseService.savePortfolioExternalLink(newPortfolio.id, link, client)))

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

	function modificationOrder(a: ModifyPortfolioAddons<unknown, unknown>, b: ModifyPortfolioAddons<unknown, unknown>): number {
		return MODIFICATION_ORDER[a.modificationType] - MODIFICATION_ORDER[b.modificationType]
	}

	if (portfolio.tags) for (const tag of portfolio.tags.sort(modificationOrder as never)) {
		switch (tag.modificationType) {
		case (FORM_MODIFiCATION_TYPE.DELETE):
			await tagDatabaseService.removeTagFromPortfolio(tag.name, id, client)
			break
		case (FORM_MODIFiCATION_TYPE.NEW):
			await tagDatabaseService.saveTag(tag.name, id, client)
			break
		}
	}

	if (portfolio.authors) for (const author of portfolio.authors.sort(modificationOrder as never)) {
		switch (author.modificationType) {
		case (FORM_MODIFiCATION_TYPE.DELETE):
			await authorDatabaseService.removeAuthorFromPortfolio(author.name, id, client)
			break
		case (FORM_MODIFiCATION_TYPE.NEW):
			await authorDatabaseService.saveAuthor(author.name, id, client)
			break
		}
	}

	if (portfolio.files) for (const file of portfolio.files.sort(modificationOrder)) {
		if (file.modificationType === FORM_MODIFiCATION_TYPE.DELETE) {
			await deleteFile(file.id, client)
		}
		else if (file.modificationType === FORM_MODIFiCATION_TYPE.UPDATE) {
			await updateFileOrder(file.id, file.order, client)
		}
		else if (file.modificationType === FORM_MODIFiCATION_TYPE.NEW) {
			await saveFile(file.name, file.contents, {id, order: file.order}, client)
		}
	}

	if (portfolio.images) for (const image of portfolio.images.sort(modificationOrder)) {
		if (image.modificationType === FORM_MODIFiCATION_TYPE.DELETE) {
			await deleteFile(image.id, client)
		}
		else if (image.modificationType === FORM_MODIFiCATION_TYPE.UPDATE) {
			await updateFileOrder(image.id, image.order, client)
		}
		else if (image.modificationType === FORM_MODIFiCATION_TYPE.NEW) {
			await saveFile(image.name, image.contents, {id, order: image.order}, client)
		}
	}

	if (portfolio.externalLinks) for (const link of portfolio.externalLinks.sort(modificationOrder)) {
		if (link.modificationType === FORM_MODIFiCATION_TYPE.DELETE) {
			await portfolioExternalLinksDatabaseService.deletePortfolioExternalLink(link.id, client)
		}
		else if (link.modificationType === FORM_MODIFiCATION_TYPE.UPDATE || link.modificationType === FORM_MODIFiCATION_TYPE.NEW) {

			await portfolioExternalLinksDatabaseService.savePortfolioExternalLink(id, link, client)
		}
	}

	await commit(client)
}
