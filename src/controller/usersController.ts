import asyncHandler from 'express-async-handler'
import express from 'express'
import {Response} from '../types/Response'
import validateAuthentication from '../middleware/validateAuthentication'
import UsersPostBody from '../types/UsersPostBody'
import {addUser} from '../services/usersService'

const router = express.Router()

router.post<unknown, Response<{ message: string }>, UsersPostBody>('/', validateAuthentication, asyncHandler(async (req, res) => {
	await addUser(req.body)
	res.status(200).send({ success: true, message: 'Kasutaja loodud' })
}))

export default router
