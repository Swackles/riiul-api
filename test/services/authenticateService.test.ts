import {query} from '../../src/database/services/databaseService'
import {generateJwtToken, login, validateToken} from '../../src/services/authenticateService'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

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
			.toEqual('INVALID_EMAIL_OR_PASSWORD')
	})

	it('should throw an error if password doesn\'t match the email', () => {
		expect(login('TEST_EMAIL', 'TEST'))
			.rejects
			.toEqual('INVALID_EMAIL_OR_PASSWORD')
	})
})

describe('validateToken', () => {
	it('should return id inside the payload', () => {
		expect(validateToken(generateJwtToken(9))).toBe(9)
	})

	test.each`
	msg 						| token
	${'is expired'}				| ${jwt.sign({ id: 9 }, process.env.JWT_TOKEN, { expiresIn: -20000 })}
	${'has invalid signature'}	| ${jwt.sign({ id: 9 }, 'random key')}
	${'is malformed'}			| ${'random token'}
	${'is undefined'}			| ${undefined}
	${'is null'}				| ${null}
	${'is empty'}				| ${''}
	`('should throw an error with 401 status when token ("$msg")', ({ token }) => {
		try {
			validateToken(token)
		} catch(err) {
			expect(err.status).toBe(401)
			expect(err.message).toBe('INVALID_TOKEN')
		}
	})
})
