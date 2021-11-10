import express from 'express'
import SpecialitiesListResponse from '../types/SpecialitiesListResponse'
import {getSpecialities} from '../services/specialitiesService'

const router = express.Router()

router.get<unknown, SpecialitiesListResponse>('/', (req, res) => {
	res.status(200).send(getSpecialities())
})

export default router
