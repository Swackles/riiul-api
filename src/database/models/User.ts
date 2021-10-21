import BaseModal from './BaseModal'

type User = BaseModal & {
	name: string
	email: string
	password: string
}

export default User
