import {Files} from './PortfolioPostBody'
import PortfolioUpdateFileType from '../enums/PortfolioUpdateFileType'

export type PortfolioDeleteFiles = {
	id: number
	type: PortfolioUpdateFileType.DELETE
}

export type PortfolioUpdateFile = {
	id: number
    order: number
	type: PortfolioUpdateFileType.UPDATE
}

export type PortfolioNewFile = Files & {
	order: number
	type: PortfolioUpdateFileType.NEW
}

type PortfolioUpdateBody = {
	subjectId?: number
	title?: string
	description?: string
	tags?: string[],
	authors?: string[],
	priority?: boolean,
	active?: boolean,
	images?: (PortfolioDeleteFiles | PortfolioUpdateFile | PortfolioNewFile)[]
	files?: (PortfolioDeleteFiles | PortfolioUpdateFile | PortfolioNewFile)[]
	videoLink?: string
	graduationYear?: number
}

export default PortfolioUpdateBody
