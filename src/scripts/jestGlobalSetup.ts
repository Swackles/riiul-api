import {query} from '../database/services/databaseService'
import UserDatabaseType from '../database/types/UserDatabaseType'
import bcrypt from 'bcrypt'

async function jestGlobalSetup(): Promise<void> {
	const password = await bcrypt.hash('test_password', parseInt(process.env.SALT_ROUNDS))

	await query<UserDatabaseType>('INSERT INTO users (id, name, email, password) VALUES ($1, $2, $3, $4) RETURNING *',
		[1, 'test_username', 'test.test@gmail.com', password])
}

export default jestGlobalSetup
