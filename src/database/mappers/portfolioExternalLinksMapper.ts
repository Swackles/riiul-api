import PortfolioExternalLinkDatabaseType from '../types/PortfolioExternalLinkDatabaseType'
import PortfolioExternalLink from '../../types/PortfolioExternalLink'

function portfolioExternalLinksMapper(externalLink?: PortfolioExternalLinkDatabaseType): PortfolioExternalLink | null {
	if (!externalLink) return null

	const newTag: PortfolioExternalLinkDatabaseType = { ...externalLink }

	delete newTag.created_at
	delete newTag.updated_at
	delete newTag.portfolio_id

	return newTag
}

export default portfolioExternalLinksMapper
