import {saveFile} from '../../src/services/filesService'
import fs from 'fs'
import path from 'path'
import filesDatabaseService from '../../src/database/services/filesDatabaseService'
import {query} from '../../src/database/services/databaseService'

const IMAGE_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

describe('saveFile', () => {
	const dir = path.join(__dirname, '../../files/')
	let data: string[] = []

	afterAll(async () => {
		await query('DELETE FROM files WHERE extension = $1 AND name = $2', data)
	})

	it('should store the file on the disk', async () => {
		const spy = jest.spyOn(fs, 'writeFileSync').mockImplementation()
		fs.existsSync = jest.fn().mockReturnValue(true)

		const res = await saveFile('test-file.png', IMAGE_BASE64)
		data = [res.extension, res.name]
		expect(res).not.toBeNull()
		expect(res.originalName).toBe('test-file')
		expect(res.extension).toBe('png')
		expect(res.name).toMatch(/[0-9]{13}-test-file/)

		expect(res.createdAt).not.toBeNull()
		expect(res.updatedAt).not.toBeNull()

		expect(spy).toHaveBeenCalledWith(path.join(dir, `${res.name}.${res.extension}`), IMAGE_BASE64 , 'base64')

		await expect(filesDatabaseService.findWithNameAndExtension(res.name, res.extension)).resolves.toEqual(res)
	})

	it('should create the path', async () => {
		jest.spyOn(fs, 'writeFileSync').mockImplementation()
		jest.spyOn(filesDatabaseService, 'save').mockImplementation()

		fs.existsSync = jest.fn().mockReturnValue(false)
		fs.mkdirSync = jest.fn().mockImplementation()

		await saveFile('test-file.png', IMAGE_BASE64)

		expect(fs.existsSync).toHaveBeenCalledWith(dir)
		expect(fs.mkdirSync).toHaveBeenCalledWith(dir, { recursive: true })
	})

	it('should not create the path', async () => {
		jest.spyOn(fs, 'writeFileSync').mockImplementation()
		jest.spyOn(filesDatabaseService, 'save').mockImplementation()

		fs.existsSync = jest.fn().mockReturnValue(true)
		fs.mkdirSync = jest.fn().mockImplementation()

		await saveFile('test-file.png', IMAGE_BASE64)

		expect(fs.existsSync).toHaveBeenCalledWith(dir)
		expect(fs.mkdirSync).not.toHaveBeenCalled()
	})
})
