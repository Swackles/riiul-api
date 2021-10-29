import UserDatabaseType from '../types/UserDatabaseType'
import {query} from './databaseService'
import User from '../../types/User'
import userMapper from '../mappers/userMapper'
import UsersPostBody from '../../types/UsersPostBody'

const UPDATEABLE_FIELDS = ['name', 'email', 'password']

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

export async function updateUser(id: number, user: UsersPostBody): Promise<User> {
	const values: Array<string | number> = [id, new Date().toISOString()]
	const fields = []

	for (const [key, value] of Object.entries(user)) {
		if (!UPDATEABLE_FIELDS.includes(key)) continue

		values.push(value)
		fields.push(`${key} = $${values.length}`)
	}

	const res = await query<UserDatabaseType>(`UPDATE users SET ${fields.join(', ')}, updated_at = $2 WHERE id = $1 RETURNING *`, values)

	return userMapper(res.rows[0])
}

export default {
	findUserWithId,
	findUserWithEmail,
	saveUser,
	updateUser
}
