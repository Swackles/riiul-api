import File from '../../types/File'
import {query} from './databaseService'
import FileDatabaseType from '../types/FileDatabaseType'
import SaveFileType from '../types/SaveFileType'
import fileMapper from '../mappers/fileMapper'

async function findWithNameAndExtension(name: string, extension: string): Promise<File> {
	const res = await query<FileDatabaseType>(
		'SELECT * FROM files WHERE extension = $1 AND name = $2',
		[extension, name]
	)

	return fileMapper(res.rows[0])
}

async function save(file: SaveFileType): Promise<File> {
	const res = await query<FileDatabaseType>(
		'INSERT INTO files (name, extension, original_name, portfolio_id, portfolio_order) VALUES ($1, $2, $3, $4, $5) RETURNING *',
		[file.name, file.extension, file.originalName, file.portfolioId, file.portfolioOrder])

	return fileMapper(res.rows[0])
}

async function deleteFile(id: number): Promise<void> {
	await query('DELETE FROM files WHERE id = $1', [id])
}

export default {
	findWithNameAndExtension,
	deleteFile,
	save
}
