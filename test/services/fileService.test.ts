import {getFile, saveFile} from '../../src/services/filesService'
import fs from 'fs'
import path from 'path'
import filesDatabaseService from '../../src/database/services/filesDatabaseService'
import {query} from '../../src/database/services/databaseService'
import faker from 'faker'

const IMAGE_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
const dir = path.join(__dirname, '../../files/')

describe('getFile', () => {
	it('should return the image buffer', async () => {
		const data = Buffer.allocUnsafe(1)

		jest.spyOn(fs, 'existsSync').mockImplementation(() => true)
		jest.spyOn(fs, 'readFileSync').mockImplementation(() => data)

		await expect(getFile('get-file-return.png')).resolves
			.toEqual(data)
	})

	it('should throw 404 error', async () => {
		jest.spyOn(fs, 'existsSync').mockImplementation(() => false)
		jest.spyOn(fs, 'readFileSync').mockImplementation()

		await expect(getFile('get-file-throw.png')).rejects
			.toEqual({ status: 404, message: 'File not found' } as never)
	})
})

describe('saveFile', () => {
	let data: string[] = []
	let id: number

	beforeAll(async () => {
		const res = await query<{id: number}>(`INSERT INTO portfolios (subject_id, title, description, priority, active) VALUES
				($1, $2, $3, $4, $5) RETURNING id`,
		[1, faker.random.word(), faker.random.word(), 'false', 'true'])

		id = res.rows[0].id
	})

	afterAll(async () => {
		await query('DELETE FROM files WHERE extension = $1 AND name = $2', data)
		await query('DELETE FROM portfolios WHERE id = $1', [id])
	})

	it('should store the file on the disk', async () => {
		jest.spyOn(fs, 'writeFileSync').mockImplementation()
		jest.spyOn(fs, 'existsSync').mockImplementation(() => true)

		const res = await saveFile('save-file-store.png', IMAGE_BASE64, { order: 0, id })
		data = [res.extension, res.name]
		expect(res).not.toBeNull()
		expect(res.originalName).toBe('save-file-store')
		expect(res.extension).toBe('png')
		expect(res.name).toMatch(/[0-9]{13}-save-file-store/)

		expect(res.createdAt).not.toBeNull()
		expect(res.updatedAt).not.toBeNull()

		await expect(filesDatabaseService.findWithNameAndExtension(res.name, res.extension)).resolves.toEqual(res)
	})

	it('should create the path', async () => {
		jest.spyOn(filesDatabaseService, 'save').mockImplementation()
		jest.spyOn(fs, 'writeFileSync').mockImplementation()
		const spyMkdirSync = jest.spyOn(fs, 'mkdirSync').mockImplementation()
		const spyExistsSync = jest.spyOn(fs, 'existsSync').mockImplementation(() => false)

		await saveFile('save-file-create.png', IMAGE_BASE64, { order: 1, id })

		expect(spyExistsSync).toHaveBeenCalledWith(dir)
		expect(spyMkdirSync).toHaveBeenCalledWith(dir, { recursive: true })
	})

	it('should not create the path', async () => {
		jest.spyOn(filesDatabaseService, 'save').mockImplementation()
		jest.spyOn(fs, 'writeFileSync').mockImplementation()
		const spyMkdirSync = jest.spyOn(fs, 'mkdirSync').mockImplementation()
		const spyExistsSync = jest.spyOn(fs, 'existsSync').mockImplementation(() => true)

		await saveFile('save-file-create-not.png', IMAGE_BASE64, { order: 2, id })

		expect(spyExistsSync).toHaveBeenCalledWith(dir)
		expect(spyMkdirSync).not.toHaveBeenCalledWith('save-file-create-not.png', { recursive: true })
	})
})
