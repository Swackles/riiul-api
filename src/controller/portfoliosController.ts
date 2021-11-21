import asyncHandler from 'express-async-handler'
import express from 'express'
import {addPortfolio, deletePortfolio, getPortfolios} from '../services/portfoliosService'
import PortfolioListResponse from '../types/PortfolioListResponse'
import optionalAuthentication from '../middleware/optionalAuthentication'
import validateAuthentication from '../middleware/validateAuthentication'
import PortfolioPostBody from '../types/PortfolioPostBody'

const router = express.Router()

router.get<unknown, PortfolioListResponse[]>('/', optionalAuthentication, asyncHandler(async (req, res) => {
	res.status(200).send(await getPortfolios(res.locals.user))
}))

router.delete<{id: number}, never>('/:id([0-9]+)', validateAuthentication, asyncHandler(async (req, res) => {
	await deletePortfolio(req.params.id)
	res.status(200).send()
}))

router.post<unknown, never, PortfolioPostBody>('/', validateAuthentication, asyncHandler(async (req, res) => {
	await addPortfolio(req.body)
	res.status(200).send()
}))

export default router
