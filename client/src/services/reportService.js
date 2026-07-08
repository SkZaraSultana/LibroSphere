import api from './api'

export async function fetchReportSummary() {
  const response = await api.get('/reports/summary')
  return response.data
}

export async function fetchBorrowHistory(query = {}) {
  const response = await api.get('/reports/history', { params: query })
  return response.data
}

export async function fetchPopularBooks() {
  const response = await api.get('/reports/popular-books')
  return response.data
}

export async function fetchOverdueBooks() {
  const response = await api.get('/reports/overdue')
  return response.data
}

export async function fetchActivity(limit = 10) {
  const response = await api.get('/reports/activity', { params: { limit } })
  return response.data
}
