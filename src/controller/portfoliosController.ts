import asyncHandler from 'express-async-handler'
import express from 'express'
import {
	addPortfolio,
	deletePortfolio,
	findPortfolio,
	getPortfolios, getPreviewPortfolios,
	updatePortfolio
} from '../services/portfoliosService'
import PortfolioListResponse from '../types/PortfolioListResponse'
import optionalAuthentication from '../middleware/optionalAuthentication'
import validateAuthentication from '../middleware/validateAuthentication'
import PortfolioPostBody from '../types/PortfolioPostBody'
import PortfolioUpdateBody from '../types/PortfolioUpdateBody'
import PortfolioListQuery from '../types/PortfolioListQuery'
import PortfolioResponse from '../types/PortfolioResponse'

const router = express.Router()

router.get<{name: string}, PortfolioResponse>('/:name', optionalAuthentication, asyncHandler(async (req, res) => {
	res.status(200).send(await findPortfolio(req.params.name, res.locals.user))
}))

router.get<never, PortfolioListResponse[], never, PortfolioListQuery, never>('/', optionalAuthentication, asyncHandler(async (req, res) => {
	res.status(200).send(await getPortfolios(res.locals.user, req.query))
}))

router.get<never, Record<number, PortfolioListResponse[]>>('/preview', asyncHandler(async (req, res) => {
	res.status(200).send(await getPreviewPortfolios())
}))

router.delete<{id: number}, never>('/:id([0-9]+)', validateAuthentication, asyncHandler(async (req, res) => {
	await deletePortfolio(req.params.id)
	res.status(200).send()
}))

router.post<unknown, never, PortfolioPostBody>('/', validateAuthentication, asyncHandler(async (req, res) => {
	await addPortfolio(req.body)
	res.status(200).send()
}))

router.put<{id: number}, never, PortfolioUpdateBody>('/:id([0-9]+)', validateAuthentication, asyncHandler(async (req, res) => {
	await updatePortfolio(req.params.id, req.body)
	res.status(200).send()
}))

export default router
