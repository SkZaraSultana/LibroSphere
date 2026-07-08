import api from './api'

export async function fetchOverview() {
  const response = await api.get('/dashboard/overview')
  return response.data
}
