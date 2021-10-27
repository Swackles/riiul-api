import { usersService } from '../../database'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import AuthenticateUserInfo from '../types/AuthenticateuserInfo'

export async function login(email: string, password: string): Promise<AuthenticateUserInfo> {
	const res = await usersService.findUserWithEmail(email)
	if (!res || !bcrypt.compareSync(password, res.password)) throw { status: 401 }

	return {
		username: res.name,
		token: generateJwtToken(res.id)
	}
}

export function generateJwtToken(id: number): string {
	return jwt.sign({ id }, process.env.JWT_TOKEN, { expiresIn: 60 * 60 })
}
