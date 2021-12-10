type PortfolioListResponse = {
	id: number
	title: string
	active?: boolean
	images: string[] | {id: number, name: string}[]
	specialityId: number
}

export default PortfolioListResponse
