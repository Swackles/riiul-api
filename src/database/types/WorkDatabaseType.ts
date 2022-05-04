import BaseType from './BaseType'

type WorkDatabaseType = BaseType & {
	subject_id: number
	title: string
	description: string
	priority: boolean
	active: boolean
	graduation_year?: number
}

export default WorkDatabaseType
