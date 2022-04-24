import PortfolioListResponse from '../types/PortfolioListResponse'
import asyncHandler from 'express-async-handler'
import {getPreviewPortfolios} from '../services/portfoliosService'
import express from 'express'

const router = express.Router()

router.get<never, Record<number, PortfolioListResponse[]>>('/', asyncHandler(async (req, res) => {
	res.status(200).send(await getPreviewPortfolios())
}))

export default router
