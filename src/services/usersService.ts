import UsersPostBody from '../types/UsersPostBody'
import bcrypt from 'bcrypt'
import usersDatabaseService from '../database/services/usersDatabaseService'
import User from '../types/User'
import HttpErrorMessage from '../enums/HttpErrorMessage'
import UserListResponse from '../types/UserListResponse'
import UserResponse from '../types/UserResponse'

export async function getUsers(): Promise<UserListResponse[]> {
	const users = await usersDatabaseService.allUsers()

	return users.map(user => ({
		id: user.id,
		name: user.name
	}))
}

export async function getUser(id: number): Promise<UserResponse> {
	const user = await usersDatabaseService.getUser(id)
	if (!user) throw { status: 404, message: HttpErrorMessage.USER_NOT_FOUND }

	return {
		id: user.id,
		name: user.name,
		email: user.email
	}
}

export async function addUser(newUser: UsersPostBody): Promise<User> {
	if (!(newUser.email && newUser.password && newUser.name)) throw { status: 400, message: HttpErrorMessage.EMPTY_FIELDS }

	try {
		return await usersDatabaseService.saveUser({
			...newUser,
			password: await bcrypt.hash(newUser.password, parseInt(process.env.SALT_ROUNDS))
		})
	} catch(err) {
		if (err.constraint === 'users_email_unique') throw { status: 400, message: HttpErrorMessage.EMAIL_EXISTS }

		throw err
	}
}

export async function updateUser(id: number, user: UsersPostBody): Promise<void> {
	await usersDatabaseService.updateUser(id, user)
}

export async function deleteUser(id: number): Promise<void> {
	await usersDatabaseService.deleteUser(id)
}
