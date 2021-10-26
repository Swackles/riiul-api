type ErrorResponse = {
	success: false
	message: string
}

type SuccessResponse = {
	success: true
}

export type Response<T> = SuccessResponse & T | ErrorResponse

