import {query} from './databaseService'
import PortfolioDatabaseType from '../types/PortfolioDatabaseType'
import portfolioMapper from '../mappers/portfolioMapper'
import Portfolio from '../../types/Portfolio'
import PortfolioPostBody from '../../types/PortfolioPostBody'
import PortfolioUpdateBody from '../../types/PortfolioUpdateBody'
import PortfolioListQuery from '../../types/PortfolioListQuery'
import HttpErrorNotFound from '../../errors/HttpErrorNotFound'
import {PoolClient} from 'pg'
import HttpErrorBadRequest from '../../errors/HttpErrorBadRequest'

const UPDATABLE_FIELDS = [
	'subjectId',
	'title',
	'description',
	'priority',
	'active',
	'videoLink',
	'graduationYear'
]

function generateConditionQuery(speciality?: number, q?: string, active?: boolean): { condition: string, data: (string|number|boolean)[]} {
	const condition = []
	const data = []

	if (speciality) {
		data.push(speciality)
		condition.push(`subject_id = $${data.length}`)
	}
	if (q) {
		data.push(`%${q}%`)
		condition.push(
			'(title LIKE <<__data__>> OR description LIKE <<__data__>>)'
				.replace(/<<__data__>>/g, `$${data.length}`))
	}
	if (active) {
		data.push(active)
		condition.push('(portfolios.active = <<__data__>> AND subjects.active = <<__data__>>)'
			.replace(/<<__data__>>/g, `$${data.length}`))
	}

	return {
		condition: condition.join(' AND '),
		data
	}
}

async function findPortfolio(id: number, client?: PoolClient): Promise<Portfolio> {
	const res = await query<PortfolioDatabaseType>('SELECT * FROM portfolios WHERE id = $1', [id], client)
	if (res.rowCount === 0) throw new HttpErrorNotFound('PORTFOLIO_NOT_FOUND')

	return portfolioMapper(res.rows[0])
}

async function findPortfolioPublic(id: number, client?: PoolClient): Promise<Portfolio> {

	const res = await query<PortfolioDatabaseType>(
		'SELECT *, portfolios.id as id FROM portfolios ' +
		'LEFT JOIN subjects ON subjects.id = portfolios.subject_id ' +
		'WHERE portfolios.id = $1 ' +
		'AND portfolios.active = $2 ' +
		'AND subjects.active = $2', [id, true], client)
	if (res.rowCount === 0) throw new HttpErrorNotFound('PORTFOLIO_NOT_FOUND')

	return portfolioMapper(res.rows[0])
}

async function allPortfolios(params?: PortfolioListQuery, client?: PoolClient): Promise<Portfolio[]> {
	const {condition, data} = generateConditionQuery(
		parseInt(params?.speciality),
		params?.q,
		params?.active ? params.active == 'true' : null
	)

	// noinspection SqlResolve
	const res = await query<PortfolioDatabaseType>(
		`SELECT portfolios.* FROM portfolios LEFT JOIN subjects ON subjects.id = portfolios.subject_id ${condition ? 'WHERE ' + condition : ''} order by portfolios.priority desc, portfolios.id desc`,
		data,
		client
	)

	return res.rows.map(portfolioMapper)
}

async function allPortfoliosPublic(params?: PortfolioListQuery, client?: PoolClient): Promise<Portfolio[]> {
	params = {
		...params,
		active: 'true'
	}

	return await allPortfolios(params, client)
}

async function deletePortfolio(id: number, client?: PoolClient): Promise<void> {
	const res = await query('DELETE FROM portfolios WHERE id = $1', [id], client)
	if (res.rowCount === 0) throw new HttpErrorNotFound('PORTFOLIO_NOT_FOUND')
}

async function savePortfolio(portfolio: PortfolioPostBody, client: PoolClient): Promise<Portfolio> {
	const data = [
		portfolio.subjectId,
		portfolio.title,
		portfolio.description,
		portfolio.priority,
		portfolio.active,
		portfolio.videLink,
		portfolio.graduationYear
	]
	const res = await query<PortfolioDatabaseType>('INSERT INTO portfolios' +
		'(subject_id, title, description, priority, active, video_link, graduation_year)' +
		'VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', data, client)

	return portfolioMapper(res.rows[0])
}

async function updatePortfolio(id: number, portfolio: PortfolioUpdateBody, client: PoolClient): Promise<Portfolio> {
	const values: (boolean|string|number)[] = [id, new Date().toISOString()]
	const fields = []

	for (const [key, value] of Object.entries(portfolio)) {
		if (!UPDATABLE_FIELDS.includes(key)) continue

		values.push(value as boolean|string|number)
		fields.push(`${key.replace(/([A-Z])/g, '_$1').trim()} = $${values.length}`)
	}

	if (fields.length === 0) throw new HttpErrorBadRequest('NO_FIELDS_TO_UPDATE')

	const res = await query<PortfolioDatabaseType>(`UPDATE portfolios SET ${fields.join(', ')}, updated_at = $2 WHERE id = $1 RETURNING *`, values, client)
	if (res.rowCount === 0) throw new HttpErrorNotFound('PORTFOLIO_NOT_FOUND')

	return portfolioMapper(res.rows[0])
}

export default {
	allPortfolios,
	allPortfoliosPublic,
	findPortfolio,
	findPortfolioPublic,
	deletePortfolio,
	savePortfolio,
	updatePortfolio
}
