import { NextFunction, Request, Response } from 'express'
import asyncHandler from 'express-async-handler'
import {validateToken} from '../services/authenticateService'
import {findUserWithId} from '../database/services/usersDatabaseService'
import HttpErrorUnauthorized from '../errors/HttpErrorUnauthorized'

async function validateAuthentication(req: Request<never>, res: Response, next: NextFunction) {
	res.locals.user = await findUserWithId(validateToken(req.headers.authorization))
	if (!res.locals.user.id) throw new HttpErrorUnauthorized('INVALID_TOKEN')

	next()
}

export default asyncHandler(validateAuthentication)
