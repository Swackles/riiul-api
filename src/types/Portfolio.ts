import {DateTime} from 'luxon'

type User = {
	id: number
	specialityId: number
	title: string
	description: string
	tags: string
	authors: string
	priority: boolean
	active: boolean
	createdAt: DateTime
	updatedAt: DateTime
}

export default User
