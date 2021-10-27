import BaseType from './BaseType'

type User = BaseType & {
	name: string
	email: string
	password: string
}

export default User
