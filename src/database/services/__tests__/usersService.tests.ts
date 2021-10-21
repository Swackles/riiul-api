import { query } from '../databaseService'
import {findUserWithEmail} from '../usersService'

describe('findUserWithEmail', () => {
	const data = ['TEST_NAME', 'TEST_EMAIL', 'TEST_PASSWORD']
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
