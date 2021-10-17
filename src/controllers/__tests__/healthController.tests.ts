import request from 'supertest'
import app from '../../app'

describe('healthController', () => {
	describe('check if server is healthy', () => {
		it('should return 200', async () => {
			const response = await request(app).get('/health')
			expect(response.statusCode).toBe(200)
		})
	})
})
