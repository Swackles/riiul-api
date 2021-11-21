import { NextFunction, Request, Response } from 'express'
import asyncHandler from 'express-async-handler'
import {validateToken} from '../services/authenticateService'
import {findUserWithId} from '../database/services/usersDatabaseService'

async function optionalAuthentication(req: Request<never>, res: Response, next: NextFunction) {
	const userId = validateToken(req.headers.authorization, true)
	if (userId)
		res.locals.user = await findUserWithId(userId)

	next()
}

export default asyncHandler(optionalAuthentication)
