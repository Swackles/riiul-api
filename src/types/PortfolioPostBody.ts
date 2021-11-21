type Files = {
	fileName: string
	contents: string
}

type UsersPostBody = {
	subjectId: number
	title: string
	description: string
	tags: string,
	authors: string,
	priority: boolean,
	active: boolean,
	files: Files[]
}

export default UsersPostBody
