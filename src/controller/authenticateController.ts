import asyncHandler from 'express-async-handler'
import express from 'express'
import {login} from '../services/authenticateService'
import AuthenticateLoginBody from '../types/AuthenticateLoginBody'
import AuthenticateLoginResponse from '../types/AuthenticateLoginResponse'
import {Response} from '../types/Response'

const router = express.Router()

router.post<unknown, Response<AuthenticateLoginResponse>, AuthenticateLoginBody>('/login', asyncHandler(async (req, res) => {
	res.status(200).send({
		success: true,
		user: await login(req.body.email, req.body.password)
	})
}))

export default router
