import BaseType from './BaseType'

type FileDatabaseType = BaseType & {
	name: string
	extension: string
	original_name: string
}

export default FileDatabaseType
