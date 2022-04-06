import {query} from './databaseService'
import {PoolClient} from 'pg'
import Author from '../../types/Author'
import AuthorDatabaseType from '../types/AuthorDatabaseType'
import authorMapper from '../mappers/authorMapper'

async function allAuthors(client?: PoolClient): Promise<Author[]> {
	const res = await query<AuthorDatabaseType>('SELECT * FROM authors ORDER BY id desc', [], client)

	return res.rows.map(authorMapper)
}

async function allAuthorsPublic(client?: PoolClient): Promise<Author[]> {
	const res = await query<AuthorDatabaseType>(
		`SELECT DISTINCT a.id, a.name, a.updated_at, a.created_at FROM authors_in_portfolio as aip
			RIGHT JOIN portfolios as p ON p.id = aip.portfolio_id
			RIGHT JOIN authors a on a.id = aip.author_id
			WHERE p.active = true
			ORDER BY a.id desc`,
		[],
		client)

	return res.rows.map(authorMapper)
}

async function findWithPortfolioId(portfoliosId: number, client?: PoolClient): Promise<Author[]> {
	const res = await query<AuthorDatabaseType>(
		`SELECT a.* FROM authors_in_portfolio as aip
			RIGHT JOIN authors a on aip.author_id = a.id
			WHERE aip.portfolio_id = $1`,
		[portfoliosId],
		client
	)

	return res.rows.map(authorMapper)
}

async function saveAuthor(authorName: string, portfolioId: number, client?: PoolClient): Promise<Author> {
	const { rows: authors } = await query<AuthorDatabaseType>(
		`INSERT INTO authors (name) VALUES ($1)
			ON CONFLICT ON CONSTRAINT authors_name_key
			DO UPDATE set name = $1 RETURNING *`,
		[authorName],
		client
	)

	await query(
		`INSERT INTO authors_in_portfolio (portfolio_id, author_id) VALUES ($1, $2)
		ON CONFLICT ON CONSTRAINT authors_in_portfolio_uniq_portfolio_id_author_id
		DO NOTHING`,
		[portfolioId, authors[0].id],
		client)

	return authorMapper(authors[0])
}

export default {
	allAuthors,
	allAuthorsPublic,
	findWithPortfolioId,
	saveAuthor,
}
