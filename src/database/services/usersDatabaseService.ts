import UserDatabaseType from '../types/UserDatabaseType'
import {query} from './databaseService'
import User from '../../types/User'
import userMapper from '../mappers/userMapper'
import UsersPostBody from '../../types/UsersPostBody'

export async function findUserWithId(id: number): Promise<User | null> {
	const res = await query<UserDatabaseType>('SELECT * FROM users WHERE id = $1', [id])

	return userMapper(res.rows[0])
}

export async function findUserWithEmail(email: string): Promise<User | null> {
	const res = await query<UserDatabaseType>('SELECT * FROM users WHERE email = $1', [email])

	return userMapper(res.rows[0])
}

export async function saveUser(user: UsersPostBody): Promise<User> {
	const data = [user.name, user.email, user.password]
	const res = await query<UserDatabaseType>('INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *', data)

	return  userMapper(res.rows[0])
}

export default {
	findUserWithId,
	findUserWithEmail,
	saveUser
}
