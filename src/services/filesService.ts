import File from '../types/File'
import filesDatabaseService from '../database/services/filesDatabaseService'
import fs from 'fs'
import path from 'path'
import {DateTime} from 'luxon'

const dir = path.join(__dirname, '/../../files/')

export async function getFile(name: string): Promise<Buffer> {
	const filePath = path.join(dir, name)
	if (!fs.existsSync(filePath)) throw { status: 404, message: 'File not found' }

	return fs.readFileSync(filePath)
}

export async function saveFile(filename: string, data: string): Promise<File> {
	const originalName = filename.split('.')[0]
	const file = {
		name: `${DateTime.now().toMillis()}-${originalName}`,
		originalName,
		extension: filename.split('.').pop(),
	}

	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

	fs.writeFileSync(path.join(dir, `${file.name}.${file.extension}`), data, 'base64')

	return await filesDatabaseService.save(file)
}
