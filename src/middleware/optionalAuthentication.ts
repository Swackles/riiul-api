import { NextFunction, Request, Response } from 'express'
import asyncHandler from 'express-async-handler'
import {validateToken} from '../services/authenticateService'
import {findUserWithId} from '../database/services/usersDatabaseService'

async function optionalAuthentication(req: Request<never>, res: Response, next: NextFunction) {
	if (req.headers.authorization) {
		res.locals.user = await findUserWithId(validateToken(req.headers.authorization))
	}

	next()
}

export default asyncHandler(optionalAuthentication)
