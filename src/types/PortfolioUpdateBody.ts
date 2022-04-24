import {Files} from './PortfolioPostBody'
import FORM_MODIFICATION_TYPE from '../enums/FORM_MODIFiCATION_TYPE'
import PortfolioExternalLinkSave from './PortfolioExternalLinkSave'

type DeletePortfolioAddons = {
	id: number
	modificationType: FORM_MODIFICATION_TYPE.DELETE
}

type UpdatePortfolioAddons<T> = T & {
	id: number
	modificationType: FORM_MODIFICATION_TYPE.UPDATE
}

type AddPortfolioAddons<T> = T & {
	modificationType: FORM_MODIFICATION_TYPE.NEW
}

export type ModifyPortfolioAddons<A, U> =
	AddPortfolioAddons<A> |
	UpdatePortfolioAddons<U> |
	DeletePortfolioAddons

export type PortfolioFileUpdateBody = ModifyPortfolioAddons<Files & { order: number }, { order: number }>
export type PortfolioExternalLinkUpdateBody = ModifyPortfolioAddons<PortfolioExternalLinkSave, PortfolioExternalLinkSave>

export type PortfolioNewKeywordUpdateForm = {
	name: string
	modificationType: FORM_MODIFICATION_TYPE.NEW
}

export type PortfolioDeleteKeywordUpdateForm = {
	name: string
	modificationType: FORM_MODIFICATION_TYPE.DELETE
}

export type PortfolioKeywordUpdateForm = (
	PortfolioDeleteKeywordUpdateForm |
	PortfolioNewKeywordUpdateForm
	)

export type PortfolioUpdateBody = {
	subjectId?: number
	title?: string
	description?: string
	tags?: PortfolioKeywordUpdateForm[]
	authors?: PortfolioKeywordUpdateForm[]
	priority?: boolean
	active?: boolean
	externalLinks?: PortfolioExternalLinkUpdateBody[]
	graduationYear?: number
	images?: PortfolioFileUpdateBody[]
	files?: PortfolioFileUpdateBody[]
}

export default PortfolioUpdateBody
