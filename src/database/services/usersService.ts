import UserDatabaseType from '../types/UserDatabaseType'
import {query} from './databaseService'

export async function findUserWithEmail(email: string): Promise<UserDatabaseType | null> {
	const res = await query<UserDatabaseType>('SELECT * FROM users WHERE email = $1', [email])

	return res.rows[0] || null
}
