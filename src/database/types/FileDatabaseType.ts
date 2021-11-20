import BaseType from './BaseType'

type FileDatabaseType = BaseType & {
	name: string
	extension: string
	original_name: string
	portfolio_order: number
	portfolio_id: number
}

export default FileDatabaseType
