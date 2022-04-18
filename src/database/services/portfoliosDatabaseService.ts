import {query} from './databaseService'
import PortfolioDatabaseType from '../types/PortfolioDatabaseType'
import portfolioMapper from '../mappers/portfolioMapper'
import Portfolio from '../../types/Portfolio'
import PortfolioPostBody from '../../types/PortfolioPostBody'
import PortfolioUpdateBody from '../../types/PortfolioUpdateBody'
import HttpErrorNotFound from '../../errors/HttpErrorNotFound'
import {PoolClient} from 'pg'
import HttpErrorBadRequest from '../../errors/HttpErrorBadRequest'
import PortfolioQueryType from '../types/PortfolioQueryType'
import generateConditionQuery from '../util/generatePortfolioConditionQuery'

const UPDATABLE_FIELDS = [
	'subjectId',
	'title',
	'description',
	'priority',
	'active',
	'graduationYear'
]

async function findPortfolioWithTitle(title: string, client?: PoolClient): Promise<Portfolio> {
	const res = await query<PortfolioDatabaseType>('SELECT * FROM portfolios WHERE LOWER(title) = LOWER($1)', [title], client)
	if (res.rowCount === 0) throw new HttpErrorNotFound('PORTFOLIO_NOT_FOUND')

	return portfolioMapper(res.rows[0])
}

async function findPortfolioPublicWithTitle(title: string, client?: PoolClient): Promise<Portfolio> {

	const res = await query<PortfolioDatabaseType>(
		'SELECT *, portfolios.id as id FROM portfolios ' +
		'LEFT JOIN subjects ON subjects.id = portfolios.subject_id ' +
		'WHERE LOWER(portfolios.title) = LOWER($1) ' +
		'AND portfolios.active = $2 ' +
		'AND subjects.active = $2', [title, true], client)
	if (res.rowCount === 0) throw new HttpErrorNotFound('PORTFOLIO_NOT_FOUND')

	return portfolioMapper(res.rows[0])
}

async function allPortfolios(params?: PortfolioQueryType, client?: PoolClient): Promise<Portfolio[]> {
	const {condition, data} = generateConditionQuery(params)

	const res = await query<PortfolioDatabaseType>(
		`SELECT res.* FROM (
    			SELECT DISTINCT ON (portfolios.id) portfolios.* FROM portfolios
					LEFT JOIN authors_in_portfolio AS aip ON aip.portfolio_id = portfolios.id
                    LEFT JOIN authors ON authors.id = aip.author_id
                    LEFT JOIN tags_in_portfolio AS tip ON tip.portfolio_id = portfolios.id
                    LEFT JOIN tags ON tags.id = tip.tag_id
					JOIN subjects on subjects.id = portfolios.subject_id
					${condition ? 'WHERE ' + condition : ''}
    				order by portfolios.id desc
    			) as res ORDER BY res.priority desc`,
		data,
		client
	)

	return res.rows.map(portfolioMapper)
}

async function allPortfoliosPublic(params?: PortfolioQueryType, client?: PoolClient): Promise<Portfolio[]> {
	params = {
		...params,
		active: true
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
		portfolio.graduationYear
	]
	const res = await query<PortfolioDatabaseType>('INSERT INTO portfolios' +
		'(subject_id, title, description, priority, active, graduation_year)' +
		'VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', data, client)

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
	findPortfolioWithTitle,
	findPortfolioPublicWithTitle,
	deletePortfolio,
	savePortfolio,
	updatePortfolio
}
