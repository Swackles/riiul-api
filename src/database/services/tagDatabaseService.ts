import {query} from './databaseService'
import {PoolClient} from 'pg'
import Tag from '../../types/Tag'
import tagMapper from '../mappers/tagMapper'
import TagDatabaseType from '../types/TagDatabaseType'

async function allTags(client?: PoolClient): Promise<Tag[]> {
	const res = await query<TagDatabaseType>('SELECT * FROM tags ORDER BY id desc', [], client)

	return res.rows.map(tagMapper)
}

async function allTagsPublic(client?: PoolClient): Promise<Tag[]> {
	const res = await query<TagDatabaseType>(
		`SELECT DISTINCT t.id, t.name, t.updated_at, t.created_at FROM tags_in_portfolio as tip
			RIGHT JOIN portfolios as p ON p.id = tip.portfolio_id
			RIGHT JOIN tags t on t.id = tip.tag_id
			WHERE p.active = true
			ORDER BY t.id desc`,
		[],
		client)

	return res.rows.map(tagMapper)
}

async function findWithPortfolioId(portfoliosId: number, client?: PoolClient): Promise<Tag[]> {
	const res = await query<TagDatabaseType>(
		`SELECT t.* FROM tags_in_portfolio as tip
			RIGHT JOIN tags t on tip.tag_id = t.id
			WHERE tip.portfolio_id = $1`,
		[portfoliosId],
		client
	)

	return res.rows.map(tagMapper)
}

async function saveTag(tagName: string, portfolioId: number, client?: PoolClient): Promise<Tag> {
	const { rows: tags } = await query<TagDatabaseType>(
		`INSERT INTO tags (name) VALUES ($1)
			ON CONFLICT ON CONSTRAINT tags_name_key
			DO UPDATE set name = $1 RETURNING *`,
		[tagName],
		client
	)

	await query(
		`INSERT INTO tags_in_portfolio (portfolio_id, tag_id) VALUES ($1, $2)
		ON CONFLICT ON CONSTRAINT tags_in_portfolio_uniq_portfolio_id_tag_id
		DO NOTHING`,
		[portfolioId, tags[0].id],
		client)

	return tagMapper(tags[0])
}

export default {
	allTags,
	allTagsPublic,
	findWithPortfolioId,
	saveTag,
}
