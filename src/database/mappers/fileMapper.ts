import {DateTime} from 'luxon'
import File from '../../types/File'
import FileDatabaseType from '../types/FileDatabaseType'

function userMapper(databaseFile?: FileDatabaseType): File | null {
	if (!databaseFile) return null

	const file = { ...databaseFile }
	delete file.created_at
	delete file.updated_at
	delete file.original_name

	return {
		...file,
		originalName: databaseFile.original_name,
		createdAt: DateTime.fromJSDate(databaseFile.created_at),
		updatedAt: DateTime.fromJSDate(databaseFile.updated_at)
	}
}

export default userMapper
