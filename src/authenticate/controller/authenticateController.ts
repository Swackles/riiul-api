import asyncHandler from 'express-async-handler'
import express from 'express'
import {login} from '../services/authenticateService'
import AuthenticateControllerGetBody from '../types/AuthenticateControllerGetBody'
import AuthenticateControllerGetResponse from '../types/AuthenticateControllerGetResponse'

const router = express.Router()

router.get<unknown, AuthenticateControllerGetResponse, AuthenticateControllerGetBody>('/', asyncHandler(async (req, res) => {
	try {
		res.status(200).send({
			success: true,
			user: await login(req.body.email, req.body.password)
		})
	} catch(err) {
		res.status(500)
	}
}))

export default router
