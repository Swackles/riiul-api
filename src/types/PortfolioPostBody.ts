import PortfolioExternalLinkSave from './PortfolioExternalLinkSave'

export type Files = {
	name: string
	contents: string
}

type PortfolioPostBody = {
	subjectId: number
	title: string
	description: string
	tags: string[],
	authors: string[],
	priority: boolean,
	active: boolean,
	graduationYear?: number,
	externalLinks: PortfolioExternalLinkSave[],
	images: Files[]
	files?: Files[]
}

export default PortfolioPostBody
