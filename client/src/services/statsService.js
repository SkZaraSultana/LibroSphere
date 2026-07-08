import api from './api'

export async function fetchDashboardStats() {
  const response = await api.get('/reports/summary')
  return response.data
}
