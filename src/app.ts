/* eslint-disable promise/prefer-await-to-callbacks */
import express, {Request, Response} from 'express'
import logger from 'morgan'
import cookieParser from 'cookie-parser'
import createError from 'http-errors'
import authenticateController from './controller/authenticateController'
import healthController from './controller/healthController'
import usersController from './controller/usersController'
import HttpErrorMessage from './enums/HttpErrorMessage'
import cors from 'cors'
import specialitiesController from './controller/subjectsController'
import filesController from './controller/filesController'
import portfoliosController from './controller/portfoliosController'
import Rollbar from 'rollbar'

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

app.use('/authenticate', authenticateController)
app.use('/files', filesController)
app.use('/health', healthController)
app.use('/subjects', specialitiesController)
app.use('/users', usersController)
app.use('/portfolios', portfoliosController)

app.use(function (req, res, next) {
	next(createError(404))
})

app.use((err: Record<string, string | number>, req: Request, res: Response,) => {
	let message = err.message
	if (!err.status && process.env.NODE_ENV !== 'development') message = HttpErrorMessage.INTERNAL_SERVER_ERROR

	const body = {
		success: false,
		message
	}

	if (process.env.NODE_ENV === 'production') {
		rollbar.error(err)
	}

	res.status(err.status as number || 500).send(body)
})

app.listen(process.env.NODE_ENV === 'test' ? 0 : process.env.PORT || 8080)

export default app
