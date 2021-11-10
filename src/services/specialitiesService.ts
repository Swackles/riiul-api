import SpecialitiesListResponse from '../types/SpecialitiesListResponse'

export function getSpecialities(): SpecialitiesListResponse {
	return [
		{
			id: 1,
			name: 'Käsitöö tehnoloogiad ja disain',
		},
		{
			id: 2,
			name: 'Rakendusinformaatika',
		},
		{
			id: 3,
			name: 'Liiklusohutus',
		},
		{
			id: 4,
			name: 'Tervisejuht',
		}
	]
}
