import File from '../types/File'
import filesDatabaseService from '../database/services/filesDatabaseService'
import fs from 'fs'
import path from 'path'
import {DateTime} from 'luxon'

export async function saveFile(filename: string, data: string): Promise<File> {
	const originalName = filename.split('.')[0]
	const file = {
		name: `${DateTime.now().toMillis()}-${originalName}`,
		originalName,
		extension: filename.split('.').pop(),
	}

	const dir = path.join(__dirname, '/../../files/')
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

	fs.writeFileSync(path.join(dir, `${file.name}.${file.extension}`), data, 'base64')

	return await filesDatabaseService.save(file)
}
