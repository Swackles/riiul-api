/* eslint-disable */
import { query } from '../../../src/database/services/databaseService'
import filesDatabaseService from '../../../src/database/services/filesDatabaseService'
import faker from 'faker'
import FileDatabaseType from '../../../src/database/types/FileDatabaseType'

describe('findWithNameAndExtension', () => {
	const originalName = faker.random.word()
	const data = [`${faker.datatype.uuid()}-${originalName}`, 'pdf', originalName]
	let id: number

	beforeEach(async () => {
		const newPortfolio = await query<{ id: number }>(
            `INSERT INTO portfolios (subject_id, title, description, priority, active) VALUES
				($1, $2, $3, $4, $5) RETURNING id`,
			[1, faker.random.word(), faker.random.word(), 'false', 'true']
        )
		const res = await query<FileDatabaseType>(
			'INSERT INTO files (portfolio_id, portfolio_order, name, extension, original_name)' +
			'VALUES ($1, $2, $3, $4, $5) RETURNING *', [newPortfolio.rows[0].id, 0, ...data])
		id = res.rows[0].id
	})

	afterEach(async () => {
		await query('DELETE FROM files WHERE id = $1', [id])
	})

	it('should return a file', async () => {
		const res = await filesDatabaseService.findWithNameAndExtension(data[0], data[1])

		expect(res.id).toBe(id)
		expect(res.name).toBe(data[0])
		expect(res.extension).toBe(data[1])
		expect(res.originalName).toBe(data[2])
	})

	it('should return null', async () => {
		const res = await  filesDatabaseService.findWithNameAndExtension('no exists', 'test')

		expect(res).toBeNull()
	})
})

describe('save', () => {
	const uniqueKey = 'FILES_DATABASE_SERVICE_SAVE_'
	let portfolioId: number
	const file = {
		name: uniqueKey + 'NAME',
		extension: 'pdf',
		originalName: uniqueKey + 'ORIGINAL_NAME',
	}

	beforeEach(async () => {
		const res = await query<{ id: number }>(
			`INSERT INTO portfolios (subject_id, title, description, priority, active) VALUES
				($1, $2, $3, $4, $5) RETURNING id`,
			[1, faker.random.word(), faker.random.word(), 'false', 'true']
		)

		portfolioId = res.rows[0].id
	})

	afterEach(async () => {
		await query('DELETE FROM files WHERE id = $1', [portfolioId])
	})

	it('should return a newly created file', async () => {
		const res = await filesDatabaseService.save({ ...file, portfolioId, portfolioOrder: faker.datatype.number() })

		expect(res).not.toBeNull()

		expect(res.name).toBe(file.name)
		expect(res.originalName).toBe(file.originalName)
		expect(res.extension).toBe(file.extension)

		expect(res.id).not.toBeNull()
		expect(res.createdAt).not.toBeNull()
		expect(res.updatedAt).not.toBeNull()

		await query('DELETE FROM files WHERE id = $1', [res.id])
	})
})

describe('delete', () => {
	const originalName = faker.random.word()
	const data = [`${faker.datatype.uuid()}-${originalName}`, 'pdf', originalName]
	let id: number

	beforeEach(async () => {
		const newPortfolio = await query<{ id: number }>(
			`INSERT INTO portfolios (subject_id, title, description, priority, active) VALUES
				($1, $2, $3, $4, $5) RETURNING id`,
			[1, faker.random.word(), faker.random.word(), 'false', 'true']
		)
		const res = await query<FileDatabaseType>(
			'INSERT INTO files (portfolio_id, portfolio_order, name, extension, original_name)' +
			'VALUES ($1, $2, $3, $4, $5) RETURNING *', [newPortfolio.rows[0].id, 0, ...data])
		id = res.rows[0].id
	})

	it('should delete the file', async () => {
		expect(filesDatabaseService.deleteFile(id)).resolves
			.toBeUndefined()
			.then(async () => {
				const res = await query('SELECT * FROM files WHERE id = $1', [id])

				expect(res.rowCount).toBe(0)
			})
			.finally(async () => {
				const res = await query<FileDatabaseType>('DELETE FROM files WHERE id = $1 RETURNING *', [id])

				expect(res.rowCount).toBe(0)
			})
	})
})
