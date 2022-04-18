import {DateTime} from 'luxon'

type Portfolio = {
	id: number
	specialityId: number
	title: string
	description: string
	tags?: string[]
	authors?: string[]
	priority: boolean
	active: boolean
	createdAt: DateTime
	updatedAt: DateTime
	graduationYear?: number
}

export default Portfolio
