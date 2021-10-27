import request from 'supertest'
import app from '../../src/app'
import * as faker from 'faker'
import {query} from '../../src/database/services/databaseService'
import {generateJwtToken} from '../../src/services/authenticateService'

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
