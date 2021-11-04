import request from 'supertest'
import app from '../../src/app'
import bcrypt from 'bcrypt'
import {query} from '../../src/database/services/databaseService'

describe('login', () => {
	const data = ['TEST_NAME', 'AUTH_CONTROLLER_TEST_EMAIL', bcrypt.hashSync('TEST_PASSWORD', 10)]
	beforeAll(async () => {
		await query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3)', data)
	})

	afterAll(async () => {
		await query('DELETE FROM users WHERE name = $1 AND email = $2 AND password = $3', data)
	})

	it('should return when logging in with correct credentials', async () => {
		const body = {
			password: 'TEST_PASSWORD',
			email: 'AUTH_CONTROLLER_TEST_EMAIL'
		}

		const response = await request(app)
			.post('/authenticate/login')
			.send(body)

		expect(response.statusCode).toBe(200)

		expect(response.body.token).not.toBeNull()
		expect(response.body.username).toBe('TEST_NAME')
	})

	it('should return error when email is incorrect', async () => {
		const body = {
			password: 'TEST_PASSWORD',
			email: 'AUTH_CONTROLLER_INCORRECT_TEST_EMAIL'
		}

		const response = await request(app)
			.post('/authenticate/login')
			.send(body)

		expect(response.statusCode).toBe(401)
	})

	it('should return error when password doesn\'t match email', async () => {
		const body = {
			password: 'INCORRECT_TEST_PASSWORD',
			email: 'AUTH_CONTROLLER_TEST_EMAIL'
		}

		const response = await request(app)
			.post('/authenticate/login')
			.send(body)

		expect(response.statusCode).toBe(401)
	})
})
