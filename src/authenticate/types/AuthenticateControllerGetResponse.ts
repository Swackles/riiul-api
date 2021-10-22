type AuthenticateControllerGetSuccessResponse = {
	success: true
	user: {
		token: string
		username: string
		useremail: string
		userID: number
	}
}

type AuthenticateControllerGetErrorResponse = {
	success: false
	message: string
}
type AuthenticateControllerGetResponse = AuthenticateControllerGetSuccessResponse | AuthenticateControllerGetErrorResponse

export default AuthenticateControllerGetResponse
