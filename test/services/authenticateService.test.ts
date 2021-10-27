import {query} from '../../src/database/services/databaseService'
import {login} from '../../src/services/authenticateService'
import bcrypt from 'bcrypt'

describe('login', () => {
	const data = ['TEST_NAME', 'AUTH_TEST_EMAIL', bcrypt.hashSync('TEST_PASSWORD', 10)]
	beforeAll(async () => {
		await query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3)', data)
	})

	afterAll(async () => {
		await query('DELETE FROM users WHERE name = $1 AND email = $2 AND password = $3', data)
	})

	it('should return user info', () => {
		const res = {
			username: 'TEST_NAME',
			token: 'TEST_JWT_TOKEN'
		}

		expect(login('AUTH_TEST_EMAIL', 'TEST_PASSWORD'))
			.resolves
			.toEqual(res)
	})

	it('should throw an error if email doesn\'t exist', () => {
		expect(login('TEST', 'TEST_PASSWORD'))
			.rejects
			.toEqual({ status: 401 })
	})

	it('should throw an error if password doesn\'t match the email', () => {
		expect(login('TEST_EMAIL', 'TEST'))
			.rejects
			.toEqual({ status: 401 })
	})
})
