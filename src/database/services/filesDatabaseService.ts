import File from '../../types/File'
import {query} from './databaseService'
import FileDatabaseType from '../types/FileDatabaseType'
import SaveFileType from '../types/SaveFileType'
import fileMapper from '../mappers/fileMapper'
import HttpErrorNotFound from '../../errors/HttpErrorNotFound'
import HttpErrorBadRequest from '../../errors/HttpErrorBadRequest'
import {PoolClient} from 'pg'

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

async function save(file: SaveFileType, client: PoolClient): Promise<File> {
	const res = await query<FileDatabaseType>(
		'INSERT INTO files (name, extension, original_name, portfolio_id, portfolio_order, type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
		[file.name, file.extension, file.originalName, file.portfolioId, file.portfolioOrder, file.type],
		client)

	return fileMapper(res.rows[0])
}

async function deleteFile(id: number, client: PoolClient): Promise<void> {
	const res = await query('DELETE FROM files WHERE id = $1', [id], client)
	if (res.rowCount === 0) throw new HttpErrorNotFound('FILE_NOT_FOUND')
}

async function updateFile(id: number, order: number, client: PoolClient): Promise<File> {
	if (!order) throw new HttpErrorBadRequest('FILE_ORDER_IS_REQUIRED')

	const res = await query<FileDatabaseType>('UPDATE files SET portfolio_order = $3, updated_at = $2 WHERE id = $1 RETURNING *',
		[id, new Date().toISOString(), order],
		client)
	if (res.rowCount === 0) throw new HttpErrorNotFound('FILE_NOT_FOUND')

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
