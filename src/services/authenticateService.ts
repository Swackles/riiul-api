import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import AuthenticateUserInfo from '../types/AuthenticateuserInfo'
import usersDatabaseService from '../database/services/usersDatabaseService'

export async function login(email: string, password: string): Promise<AuthenticateUserInfo> {
	const res = await usersDatabaseService.findUserWithEmail(email)
	if (!res || !bcrypt.compareSync(password, res.password)) throw { status: 401 }

	return {
		username: res.name,
		token: generateJwtToken(res.id)
	}
}

export function generateJwtToken(id: number): string {
	return jwt.sign({ id }, process.env.JWT_TOKEN, { expiresIn: 60 * 60 })
}

export function validateToken(token: string): number {
	let decoded: jwt.JwtPayload

	try {
		decoded = jwt.verify(token, process.env.JWT_TOKEN) as jwt.JwtPayload
	} catch (err) {
		throw {status: 401, message: err.message }
	}

	return decoded.id
}
