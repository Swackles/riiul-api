import {DateTime} from 'luxon'
import PortfolioDatabaseType from '../types/PortfolioDatabaseType'
import Portfolio from '../../types/Portfolio'

function portfolioMapper(databaseFile?: PortfolioDatabaseType): Portfolio | null {
	if (!databaseFile) return null

	const file = { ...databaseFile }
	delete file.created_at
	delete file.updated_at
	delete file.subject_id
	delete file.video_link
	delete file.graduation_year

	return {
		...file,
		graduationYear: databaseFile.graduation_year,
		videoLink: databaseFile.video_link,
		specialityId: databaseFile.subject_id,
		createdAt: DateTime.fromJSDate(databaseFile.created_at),
		updatedAt: DateTime.fromJSDate(databaseFile.updated_at)
	}
}

export default portfolioMapper
