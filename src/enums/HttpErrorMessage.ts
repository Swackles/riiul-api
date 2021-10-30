enum HttpErrorMessage {
	EMPTY_FIELDS = 'Nõutavad väljad ei ole täidetud',
	EMAIL_EXISTS = 'Sama emailiga kasutaja juba eksisteerib!',
	INTERNAL_SERVER_ERROR = 'Midagi läks valesti, proovi hiljem uuesti',
	USER_NOT_FOUND = 'Kasutajat ei eksisteeri'
}

export default HttpErrorMessage
