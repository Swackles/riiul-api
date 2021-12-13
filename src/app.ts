/* eslint-disable promise/prefer-await-to-callbacks,@typescript-eslint/no-unused-vars,@typescript-eslint/no-explicit-any */
import express, {NextFunction, Request, Response} from 'express'
import logger from 'morgan'
import cookieParser from 'cookie-parser'
import authenticateController from './controller/authenticateController'
import healthController from './controller/healthController'
import usersController from './controller/usersController'
import cors from 'cors'
import specialitiesController from './controller/subjectsController'
import filesController from './controller/filesController'
import portfoliosController from './controller/portfoliosController'
import Rollbar from 'rollbar'
import HttpError from './errors/HttpError'
import HttpErrorBadRequest from './errors/HttpErrorBadRequest'
import HttpErrorNotFound from './errors/HttpErrorNotFound'
import asyncHandler from 'express-async-handler'

const rollbar = new Rollbar({
	accessToken: process.env.ROLLBAR_TOKEN,
	captureUncaught: true,
	captureUnhandledRejections: true,
})

const app = express()

app.use(cors())

app.use(logger('dev'))
app.use(express.json({limit: '50mb'}))
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.use((_req: Request, res: Response, next: NextFunction) => {
	res.header('Access-Control-Expose-Headers', 'authorization')
	next()
})

app.use('/authenticate', authenticateController)
app.use('/files', filesController)
app.use('/health', healthController)
app.use('/subjects', specialitiesController)
app.use('/users', usersController)
app.use('/portfolios', portfoliosController)

app.use(asyncHandler(() => {
	throw new HttpErrorNotFound('NOT_FOUND')
}))

app.use((err: HttpError, req: Request, res: Response, _next: NextFunction) => {
	console.error(err.originalError || err)
	if (process.env.NODE_ENV === 'production') rollbar.error(err.originalError || err)

	if (err.status === 400 && (err as any).type === 'entity.parse.failed') {
		err = new HttpErrorBadRequest('INVALID_JSON_BODY')
	}

	res.status(err.status || 500).send(err.status ? err.getJson() : HttpError.getDefaultJson())
})

app.listen(process.env.NODE_ENV === 'test' ? 0 : process.env.PORT || 8080)

export default app
