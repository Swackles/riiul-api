import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import usersDatabaseService from '../database/services/usersDatabaseService'
import AuthenticateLoginResponse from '../types/AuthenticateLoginResponse'

export async function login(email: string, password: string): Promise<AuthenticateLoginResponse> {
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

export function validateToken(token: string, suppressError = false): number | null {
	let decoded: jwt.JwtPayload

	try {
		decoded = jwt.verify(token, process.env.JWT_TOKEN) as jwt.JwtPayload
	} catch (err) {
		if (!suppressError)
			throw {status: 401, message: err.message }
	}

	return decoded?.id || null
}
