import { NextFunction, Request, Response } from 'express'
import asyncHandler from 'express-async-handler'
import {validateToken} from '../services/authenticateService'
import {findUserWithId} from '../database/services/usersService'

async function validateAuthentication(req: Request, res: Response, next: NextFunction) {
	res.locals.user = await findUserWithId(validateToken(req.headers.authorization))
	next()
}

export default asyncHandler(validateAuthentication)
