import asyncHandler from 'express-async-handler'
import express from 'express'
import {Response} from '../types/Response'
import validateAuthentication from '../middleware/validateAuthentication'
import UsersPostBody from '../types/UsersPostBody'
import {addUser, deleteUser, getUser, getUsers, updateUser} from '../services/usersService'
import UserListResponse from '../types/UserListResponse'
import UserResponse from '../types/UserResponse'

const router = express.Router()

router.get<unknown, Response<{users: UserListResponse[]}>>('/', validateAuthentication, asyncHandler(async (req, res) => {
	res.status(200).send({ success: true, users: await getUsers() })
}))

router.get<{ id: number }, Response<{user: UserResponse}>>('/:id([0-9]+)', validateAuthentication, asyncHandler(async (req, res) => {
	res.status(200).send({ success: true, user: await getUser(req.params.id) })
}))

router.post<unknown, Response<{ message: string }>, UsersPostBody>('/', validateAuthentication, asyncHandler(async (req, res) => {
	await addUser(req.body)
	res.status(200).send({ success: true, message: 'Kasutaja loodud' })
}))

router.put<{id: number }, Response<{ message: string }>, UsersPostBody>('/:id([0-9]+)', validateAuthentication, asyncHandler(async (req, res) => {
	await updateUser(req.params.id, req.body)
	res.status(200).send({ success: true, message: 'Kasutaja uuendatud' })
}))

router.delete<{id: number}, Response<unknown>>('/:id([0-9]+)', validateAuthentication, asyncHandler(async (req, res) => {
	await deleteUser(req.params.id)
	res.status(200).send({ success: true })
}))

export default router
