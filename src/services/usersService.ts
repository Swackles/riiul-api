import UsersPostBody from '../types/UsersPostBody'
import bcrypt from 'bcrypt'
import usersDatabaseService from '../database/services/usersDatabaseService'
import User from '../types/User'
import HttpErrorMessage from '../enums/HttpErrorMessage'

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
