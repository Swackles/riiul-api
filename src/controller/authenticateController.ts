import asyncHandler from 'express-async-handler'
import express from 'express'
import {login} from '../services/authenticateService'
import AuthenticateLoginBody from '../types/AuthenticateLoginBody'
import AuthenticateLoginResponse from '../types/AuthenticateLoginResponse'

const router = express.Router()

router.get<unknown, AuthenticateLoginResponse, AuthenticateLoginBody>('/login', asyncHandler(async (req, res) => {
	res.status(200).send(await login(req.body.email, req.body.password))
}))

export default router
