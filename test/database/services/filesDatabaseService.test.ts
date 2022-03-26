/* eslint-disable */
import {begin, query, rollback} from '../../../src/database/services/databaseService'
import filesDatabaseService from '../../../src/database/services/filesDatabaseService'
import faker from 'faker'
import FileDatabaseType from '../../../src/database/types/FileDatabaseType'
import {DateTime} from 'luxon'
import {PoolClient} from 'pg'

describe('findWithNameAndExtension', () => {
	let client: PoolClient
	const originalName = faker.random.word()
	const data = [`${faker.datatype.uuid()}-${originalName}`, 'pdf', originalName]
	let id: number

	beforeAll(async () => {
		client = await begin()

		const newPortfolio = await query<{ id: number }>(
            `INSERT INTO portfolios (subject_id, title, description, priority, active) VALUES
				($1, $2, $3, $4, $5) RETURNING id`,
			[1, faker.random.word(), faker.random.word(), 'false', 'true'],
			client
        )
		id = newPortfolio.rows[0].id

		await query<FileDatabaseType>(
			'INSERT INTO files (portfolio_id, portfolio_order, name, extension, original_name)' + 'VALUES ($1, $2, $3, $4, $5) RETURNING *',
			[id, 0, ...data],
			client)
	})

	afterAll(async () => {
		await rollback(client)
	})

	it('should return a file', async () => {
		const res = await filesDatabaseService.findWithNameAndExtension(data[0], data[1], client)

		expect(res).toMatchObject({
			portfolioId: id,
			portfolioOrder: 0,
			name: data[0],
			extension: data[1],
			originalName: data[2],
		})
	})

	it('should return null', async () => {
		const res = await  filesDatabaseService.findWithNameAndExtension('no exists', 'test', client)

		expect(res).toBeNull()
	})
})

describe('findWithPortfoliosId', () => {
	let client: PoolClient
	const originalName = [faker.random.word(), faker.random.word()]

	let portfoliosIds: number[]

	beforeAll(async () => {
		client = await begin()
		const portfolios = [...new Array(2)].map(() => ([
            1, faker.random.word(), faker.random.word(), 'false', 'true'
        ]))
		const newPortfolio = await query<{ id: number }>(
			`INSERT INTO portfolios (subject_id, title, description, priority, active) VALUES
				($1, $2, $3, $4, $5),
				($6, $7, $8, $9, $10) RETURNING id`,
			portfolios.flat(),
			client
		)
		portfoliosIds = newPortfolio.rows.map(({ id }) => id)

		await query<FileDatabaseType>(
			'INSERT INTO files (portfolio_id, portfolio_order, name, extension, original_name)' +
			'VALUES ($1, $2, $3, $4, $5), ($6, $7, $8, $9, $10) RETURNING *',
			originalName.map((name, i) => [
				portfoliosIds[i], 0, `${DateTime.now().toMillis()}-${name}`, 'pdf', name
			]).flat(),
			client)
	})

	afterAll(async () => {
		await rollback(client)
	})

	test.each`
		index | length
		${[0]} | ${1}
		${[0, 1]} | ${2}
		${[]} | ${0}
	`('should return $length files when searched with "$index" portfolio indexes', async ({ index, length}: { index: number[], length: number}) => {
        const res = await filesDatabaseService.findWithPortfoliosId(index.map(i => portfoliosIds[i]), client)

		expect(res).not.toBeNull()
        expect(res.length).toBe(length)
    })
})

describe('save', () => {
	let client: PoolClient

	const uniqueKey = 'FILES_DATABASE_SERVICE_SAVE_'
	let portfolioId: number
	const file = {
		name: uniqueKey + 'NAME',
		extension: 'pdf',
		originalName: uniqueKey + 'ORIGINAL_NAME',
		portfolioOrder: faker.datatype.number(),
		type: "PDF"
	}

	beforeEach(async () => {
		client = await begin()
		const res = await query<{ id: number }>(
			`INSERT INTO portfolios (subject_id, title, description, priority, active) VALUES
				($1, $2, $3, $4, $5) RETURNING id`,
			[1, faker.random.word(), faker.random.word(), 'false', 'true'],
			client
		)

		portfolioId = res.rows[0].id
	})

	afterEach(async () => {
		await rollback(client)
	})

	it('should return a newly created file', async () => {
		const res = await filesDatabaseService.save({ ...file, portfolioId }, client)

		expect(res).not.toBeNull()
		expect(res).toMatchObject({...file, portfolioId})

		expect(res.id).not.toBeNull()
		expect(res.createdAt).not.toBeNull()
		expect(res.updatedAt).not.toBeNull()
	})
})

describe('delete', () => {
	let client: PoolClient

	const originalName = faker.random.word()
	const data = [`${faker.datatype.uuid()}-${originalName}`, 'pdf', originalName]
	let id: number
	let portfolioId: number

	beforeEach(async () => {
		client = await begin()

		const newPortfolio = await query<{ id: number }>(
			`INSERT INTO portfolios (subject_id, title, description, priority, active) VALUES
				($1, $2, $3, $4, $5) RETURNING id`,
			[1, faker.random.word(), faker.random.word(), 'false', 'true'],
			client
		)
		portfolioId = newPortfolio.rows[0].id

		const res = await query<FileDatabaseType>(
			'INSERT INTO files (portfolio_id, portfolio_order, name, extension, original_name)' +
			'VALUES ($1, $2, $3, $4, $5) RETURNING *', [newPortfolio.rows[0].id, 0, ...data],
			client)
		id = res.rows[0].id
	})

	afterEach(async () => {
		await rollback(client)
	})

	it('should delete the file', async () => {
		await filesDatabaseService.deleteFile(id, client)

		const res = await query('SELECT * FROM files WHERE id = $1', [id], client)

		expect(res).not.toBeNull()
		expect(res.rowCount).toBe(0)
	})
})
