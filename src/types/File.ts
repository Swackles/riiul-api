import {DateTime} from 'luxon'

type File = {
	id: number
	name: string
	extension: string
	originalName: string
	createdAt: DateTime
	updatedAt: DateTime
}

export default File
