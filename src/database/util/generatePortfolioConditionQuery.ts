import PortfolioQueryType from '../types/PortfolioQueryType'

function generateConditionQuery(query: PortfolioQueryType): { condition: string, data: (string|number|boolean)[]} {
	if (!query) return { condition: '', data: [] }

	const {q, specialities, active, authors, tags} = query
	const condition = []
	const data = []

	function generateConditionFromArray(params: string[]): string[] {
		const res = []

		for (const param of params) {
			data.push(param)
			res.push('$' + data.length)
		}

		return res
	}

	if (specialities && specialities.length) {
		condition.push(`subjects.name IN (${generateConditionFromArray(specialities).join(', ')})`)
	}
	if (authors && authors.length) {
		condition.push(`authors.name IN (${generateConditionFromArray(authors).join(', ')})`)
	}
	if (tags && tags.length) {
		condition.push(`tags.name IN (${generateConditionFromArray(tags).join(', ')})`)
	}
	if (q) {
		data.push(`%${q}%`)
		condition.push(
			'(title LIKE <<__data__>> OR description LIKE <<__data__>>)'
				.replace(/<<__data__>>/g, `$${data.length}`))
	}
	if (typeof active === 'boolean') {
		data.push(active)

		if (active) {
			condition.push('(portfolios.active = <<__data__>> AND subjects.active = <<__data__>>)'
				.replace(/<<__data__>>/g, `$${data.length}`))
		} else {
			condition.push('(portfolios.active = <<__data__>> OR subjects.active = <<__data__>>)'
				.replace(/<<__data__>>/g, `$${data.length}`))
		}
	}

	return {
		condition: condition.join(' AND '),
		data
	}
}

export default generateConditionQuery
