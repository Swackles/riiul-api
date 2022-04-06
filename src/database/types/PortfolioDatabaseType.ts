import BaseType from './BaseType'

type PortfolioDatabaseType = BaseType & {
	subject_id: number
	title: string
	description: string
	priority: boolean
	active: boolean
	video_link?: string
	graduation_year?: number
}

export default PortfolioDatabaseType
