import BaseType from './BaseType'
import PORTFOLIO_EXTERNAL_LINK from '../../enums/PORTFOLIO_EXTERNAL_LINK'

type PortfolioExternalLinkDatabaseType = BaseType & {
	title: string
	link: string
	type: PORTFOLIO_EXTERNAL_LINK
	portfolio_id: number
}

export default PortfolioExternalLinkDatabaseType
