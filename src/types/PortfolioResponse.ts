import PortfolioExternalLink from './PortfolioExternalLink'

type PortfolioResponse = {
	id: number
	title: string
	description: string
	specialityId: number
	tags: string[]
	authors: string[]
	priority: boolean
	active: boolean
	externalLinks: PortfolioExternalLink[]
	images: string[] | {id: number, name: string}[]
	files: string[] | {id: number, name: string}[]
}

export default  PortfolioResponse
