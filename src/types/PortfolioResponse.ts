import PortfolioListResponse from './PortfolioListResponse'

type PortfolioResponse = PortfolioListResponse & {
	description: string
	tags: string
	authors: string
	priority: boolean
	active: boolean
	files: string[] | {id: number, name: string}[]
}

export default  PortfolioResponse
