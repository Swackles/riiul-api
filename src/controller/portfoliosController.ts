import asyncHandler from 'express-async-handler'
import express from 'express'
import {getPortfolios} from '../services/portfoliosService'
import PortfolioListResponse from '../types/PortfolioListResponse'
import optionalAuthentication from '../middleware/optionalAuthentication'

const router = express.Router()

router.get<unknown, PortfolioListResponse[]>('/', optionalAuthentication, asyncHandler(async (req, res) => {
	res.status(200).send(await getPortfolios(res.locals.user))
}))

export default router
