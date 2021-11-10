import { query } from '../../../src/database/services/databaseService'
import filesDatabaseService from '../../../src/database/services/filesDatabaseService'
import faker from 'faker'
import FileDatabaseType from '../../../src/database/types/FileDatabaseType'

describe('findWithNameAndExtension', () => {
	const originalName = faker.random.word()
	const data = [`${faker.datatype.uuid()}-${originalName}`, 'pdf', originalName]
	let id: number

	beforeEach(async () => {
		const res = await query<FileDatabaseType>('INSERT INTO files (name, extension, original_name) VALUES ($1, $2, $3) RETURNING *', data)
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
	const file = {
		name: uniqueKey + 'NAME',
		extension: 'pdf',
		originalName: uniqueKey + 'ORIGINAL_NAME'
	}

	it('should return a newly created file', async () => {
		const res = await filesDatabaseService.save(file)

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
