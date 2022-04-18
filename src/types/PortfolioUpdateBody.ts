import {Files} from './PortfolioPostBody'
import PortfolioUpdateFileType from '../enums/PortfolioUpdateFileType'
import PortfolioExternalLinkSave from './PortfolioExternalLinkSave'

type DeletePortfolioAddons<T> = T & {
	id: number
	modificationType: PortfolioUpdateFileType.DELETE
}

type UpdatePortfolioAddons<T> = T & {
	id: number
	modificationType: PortfolioUpdateFileType.UPDATE
}

type AddPortfolioAddons<T> = T & {
	modificationType: PortfolioUpdateFileType.NEW
}

type ModifyPortfolioAddons<A, U, D> =
	AddPortfolioAddons<A> |
	UpdatePortfolioAddons<U> |
	DeletePortfolioAddons<D>

export type ModifyPortfolioFile = ModifyPortfolioAddons<Files & { order: number }, { order: number }, unknown>
export type ModifyPortfolioLink = ModifyPortfolioAddons<PortfolioExternalLinkSave, PortfolioExternalLinkSave, unknown>

type PortfolioUpdateBody = {
	subjectId?: number
	title?: string
	description?: string
	tags?: string[]
	authors?: string[]
	priority?: boolean
	active?: boolean
	images?: ModifyPortfolioFile[]
	files?:  ModifyPortfolioFile[]
	externalLinks?: ModifyPortfolioLink[]
	graduationYear?: number
}

export default PortfolioUpdateBody
