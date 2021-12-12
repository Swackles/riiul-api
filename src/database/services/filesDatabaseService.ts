import File from '../../types/File'
import {query} from './databaseService'
import FileDatabaseType from '../types/FileDatabaseType'
import SaveFileType from '../types/SaveFileType'
import fileMapper from '../mappers/fileMapper'

async function findWithId(id: number): Promise<File> {
	const res = await query<FileDatabaseType>(
		'SELECT * FROM files WHERE id = $1',
		[id]
	)

	return fileMapper(res.rows[0])
}

async function findWithNameAndExtension(name: string, extension: string): Promise<File> {
	const res = await query<FileDatabaseType>(
		'SELECT * FROM files WHERE extension = $1 AND name = $2',
		[extension, name]
	)

	return fileMapper(res.rows[0])
}

async function findWithPortfoliosId(portfoliosId: number[]): Promise<File[]> {
	const res = await query<FileDatabaseType>(
		'SELECT * FROM files WHERE portfolio_id = ANY($1::int[]) ORDER BY portfolio_order asc',
		[portfoliosId]
	)

	return res.rows.map(fileMapper)
}

async function save(file: SaveFileType): Promise<File> {
	const res = await query<FileDatabaseType>(
		'INSERT INTO files (name, extension, original_name, portfolio_id, portfolio_order, type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
		[file.name, file.extension, file.originalName, file.portfolioId, file.portfolioOrder, file.type])

	return fileMapper(res.rows[0])
}

async function deleteFile(id: number): Promise<void> {
	await query('DELETE FROM files WHERE id = $1', [id])
}

async function updateFile(id: number, order: number): Promise<File> {
	const res = await query<FileDatabaseType>('UPDATE files SET portfolio_order = $3, updated_at = $2 WHERE id = $1 RETURNING *',
		[id, new Date().toISOString(), order])

	return fileMapper(res.rows[0])
}

export default {
	findWithId,
	findWithNameAndExtension,
	findWithPortfoliosId,
	deleteFile,
	updateFile,
	save
}
