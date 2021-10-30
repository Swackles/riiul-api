import request from 'supertest'
import app from '../../src/app'
import * as faker from 'faker'
import {query} from '../../src/database/services/databaseService'
import {generateJwtToken} from '../../src/services/authenticateService'
import UserDatabaseType from '../../src/database/types/UserDatabaseType'

describe('get', () => {
	it('should return 200 response', async () => {
		const response = await request(app)
			.get('/users')
			.set('Authorization', generateJwtToken(1))

		expect(response.statusCode).toBe(200)
		expect(response.body.users).not.toBeNull()
	})

	it('should respond with 401 error', async () => {
		const response = await request(app)
			.get('/users')

		expect(response.statusCode).toBe(401)
	})
})

describe('post', () => {
	const body = {
		name: faker.name.firstName(),
		password: faker.internet.password(),
		email: faker.internet.email()
	}

	it('should return 200 response', async () => {
		const response = await request(app)
			.post('/users')
			.set('Authorization', generateJwtToken(1))
			.send(body)

		expect(response.statusCode).toBe(200)
		expect(JSON.parse(response.text)).toStrictEqual({
			success: true,
			message: 'Kasutaja loodud'
		})

	})

	afterAll(async () => {
		await query('DELETE * FROM users WHERE name = $1 and email = $2', [body.name, body.email])
	})
})

describe('update', () => {
	const body = {
		name: faker.name.firstName(),
		email: faker.internet.email()
	}
	let id: number

	beforeEach(async () => {
		const res = await query<UserDatabaseType>('INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
			[faker.name.firstName(), faker.internet.email(), faker.internet.password()])
		id = res.rows[0].id
	})

	afterEach(async () => {
		await query('DELETE FROM users WHERE id = $1', [id])
	})

	it('should return 200 response', async () => {
		const response = await request(app)
			.put('/users/' + id)
			.set('Authorization', generateJwtToken(1))
			.send(body)

		expect(response.statusCode).toBe(200)
		expect(JSON.parse(response.text)).toStrictEqual({
			success: true,
			message: 'Kasutaja uuendatud'
		})
	})

	it('should respond with 401 error', async () => {
		const response = await request(app)
			.put('/users/' + id)
			.send(body)

		expect(response.statusCode).toBe(401)
	})
})
