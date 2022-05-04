import WorkExternalLinkDatabaseType from '../types/WorkExternalLinkDatabaseType'
import WorkExternalLink from '../../types/WorkExternalLink'

function workExternalLinksMapper(externalLink?: WorkExternalLinkDatabaseType): WorkExternalLink | null {
	if (!externalLink) return null

	const newTag: WorkExternalLinkDatabaseType = { ...externalLink }

	delete newTag.created_at
	delete newTag.updated_at
	delete newTag.work_id

	return newTag
}

export default workExternalLinksMapper
