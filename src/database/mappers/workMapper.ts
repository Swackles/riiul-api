import {DateTime} from 'luxon'
import WorkDatabaseType from '../types/WorkDatabaseType'
import Work from '../../types/Work'

function workMapper(databaseFile?: WorkDatabaseType): Work | null {
	if (!databaseFile) return null

	const file = { ...databaseFile }
	delete file.created_at
	delete file.updated_at
	delete file.subject_id
	delete file.graduation_year

	return {
		...file,
		graduationYear: databaseFile.graduation_year,
		subjectId: databaseFile.subject_id,
		createdAt: DateTime.fromJSDate(databaseFile.created_at),
		updatedAt: DateTime.fromJSDate(databaseFile.updated_at)
	}
}

export default workMapper
