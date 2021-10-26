import User from '../types/User'
import {query} from './databaseService'

export async function findUserWithEmail(email: string): Promise<User | null> {
	const res = await query<User>('SELECT * FROM users WHERE email = $1', [email])

	return res.rows[0] || null
}
