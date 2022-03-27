import usersDatabaseService from '../database/services/usersDatabaseService'

async function jestGlobalTeardown(): Promise<void> {
	await usersDatabaseService.deleteUser(1)
}

export default jestGlobalTeardown
