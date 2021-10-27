import {addUser} from '../../src/services/usersService'
import * as faker from 'faker'
import {query} from '../../src/database/services/databaseService'
import HttpErrorMessage from '../../src/enums/HttpErrorMessage'

describe('addUser', () => {
	it('should return the new user', async () => {
		const userData = {
			email: faker.internet.email(),
			name: faker.name.firstName(),
			password: faker.internet.password()
		}

		const res = await addUser(userData)

		expect(res).not.toBeNull()

		expect(res.id).not.toBeNull()
		expect(res.createdAt).not.toBeNull()
		expect(res.updatedAt).not.toBeNull()
		expect(res.password).not.toBeNull()

		expect(res).toStrictEqual({
			id: res.id,
			createdAt: res.createdAt,
			updatedAt: res.updatedAt,
			password: res.password,
			email: userData.email,
			name: userData.name
		})

		await query('DELETE FROM users WHERE id = $1', [res.id])
	})

	test.each`
	missingKey
	${'name'}
	${'email'}
	${'password'}
	`('It should throw error when "$missingKey" is missing', async ({ missingKey }) => {
		const userData = {
			email: faker.internet.email(),
			name: faker.name.firstName(),
			password: faker.internet.password()
		}

		const data = { ...userData }

		if (missingKey === 'name') delete data.name
		if (missingKey === 'email') delete data.email
		if (missingKey === 'password') delete data.password

		await expect(addUser(data)).rejects.toStrictEqual({
			status: 400,
			message: HttpErrorMessage.EMPTY_FIELDS
		})
	})

	it('should throw error when trying to add duplicate user', async () => {
		const userData = {
			email: faker.internet.email(),
			name: faker.name.firstName(),
			password: faker.internet.password()
		}
		const res = await addUser(userData)

		const newUserData = {
			email: userData.email,
			name: faker.name.firstName(),
			password: faker.internet.password()
		}

		await expect(addUser(newUserData)).rejects.toStrictEqual({
			status: 400,
			message: HttpErrorMessage.EMAIL_EXISTS
		})

		await query('DELETE FROM users WHERE id = $1', [res.id])
	})
})
