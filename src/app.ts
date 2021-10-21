/* eslint-disable promise/prefer-await-to-callbacks */
import express, { Request, Response } from 'express'
import logger from 'morgan'
import cookieParser from 'cookie-parser'
import createError from 'http-errors'
import { healthController } from './controllers'

const app = express()

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.use('/health', healthController)

app.use(function (req, res, next) {
	next(createError(404))
})

app.use((err: Record<string, string | number>, req: Request, res: Response) => {
	res.status(err.status as number || 500).send(process.env.NODE_ENV === 'development' ? err : {})
})

app.listen(process.env.PORT || 8080)

export default app