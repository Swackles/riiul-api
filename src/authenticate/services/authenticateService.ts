import {findUserWithEmail} from '../../database/services/usersService'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

enum AuthenticateErrors {
	USER_NOT_FOUND = 'USER NOT FOUND'
}

export async function login(email: string, password: string): Promise<Record<string, unknown>> {
	const res = await findUserWithEmail(email)
	if (!res) throw new Error(AuthenticateErrors.USER_NOT_FOUND)

	if (!bcrypt.compareSync(password, res.password)) throw new Error(AuthenticateErrors.USER_NOT_FOUND)

	return {
		username: res.name,
		useremail: res.email,
		userID: res.id,
		token: generateJwtToken(res.id)
	}
}

function generateJwtToken(id: number): string {
	return jwt.sign({ id }, process.env.JWT_TOKEN, { expiresIn: 60 * 60 })
}
/*
function hashPassword(password: string): string {
	return bcrypt.hashSync(password, 10)
} */
