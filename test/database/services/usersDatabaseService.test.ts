import { query } from '../../../src/database/services/databaseService'
import {findUserWithEmail, saveUser} from '../../../src/database/services/usersDatabaseService'

describe('findUserWithEmail', () => {
	const data = ['USER_SERVICE_TEST_NAME', 'USER_SERVICE_TEST_EMAIL', 'TEST_PASSWORD']
	beforeAll(async () => {
		await query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3)', data)
	})

	afterAll(async () => {
		await query('DELETE FROM users WHERE name = $1 AND email = $2 AND password = $3', data)
	})

	it('should return a user', async () => {
		const res = await findUserWithEmail(data[1])

		expect(res).not.toBeNull()
		expect(res).toMatchObject({
			name: data[0],
			email: data[1],
			password: data[2]
		})
	})

	it('should return undefined', async () => {
		expect(await findUserWithEmail('THIS DOES NOT EXIST')).toBeNull()
	})
})

describe('saveUser', () => {
	const uniqueKey = 'USERS_SERVICE_SAVE_USER_'
	const user = {
		name: uniqueKey + 'NAME',
		email: uniqueKey + 'EMAIL',
		password: uniqueKey + 'PASSWORD'
	}

	it('should return a newly created user', async () => {
		const res = await saveUser(user)

		expect(res).not.toBeNull()

		expect(res.name).toBe(user.name)
		expect(res.password).toBe(user.password)
		expect(res.email).toBe(user.email)

		expect(res.id).not.toBeNull()
		expect(res.createdAt).not.toBeNull()
		expect(res.updatedAt).not.toBeNull()

		await query('DELETE FROM users WHERE id = $1', [res.id])
	})
})
