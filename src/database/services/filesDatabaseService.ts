import File from '../../types/File'
import {query} from './databaseService'
import FileDatabaseType from '../types/FileDatabaseType'
import SaveFileType from '../types/SaveFileType'
import fileMapper from '../mappers/fileMapper'

async function save(file: SaveFileType): Promise<File> {
	const res = await query<FileDatabaseType>(
		'INSERT INTO files (name, extension, original_name) VALUES ($1, $2, $3) RETURNING *',
		[file.name, file.extension, file.originalName])

	return fileMapper(res.rows[0])
}

export default {
	save
}
