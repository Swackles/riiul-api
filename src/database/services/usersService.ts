import UserDatabaseType from '../types/UserDatabaseType'
import {query} from './databaseService'
import User from '../../types/User'
import userMapper from '../mappers/userMapper'

export async function findUserWithEmail(email: string): Promise<User | null> {
	const res = await query<UserDatabaseType>('SELECT * FROM users WHERE email = $1', [email])

	return userMapper(res.rows[0])
}
