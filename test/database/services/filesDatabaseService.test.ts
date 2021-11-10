import { query } from '../../../src/database/services/databaseService'
import filesDatabaseService from '../../../src/database/services/filesDatabaseService'

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
