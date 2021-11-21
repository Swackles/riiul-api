import BaseType from './BaseType'

type PortfolioDatabaseType = BaseType & {
	subject_id: number
	title: string
	description: string
	tags: string
	authors: string
	priority: boolean
	active: boolean
}

export default PortfolioDatabaseType
