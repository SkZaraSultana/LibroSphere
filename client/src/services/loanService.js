import api from './api'

export async function fetchLoans(query = {}) {
  const response = await api.get('/loans', { params: query })
  return response.data
}

export async function issueLoan(payload) {
  const response = await api.post('/loans', payload)
  return response.data
}

export async function returnLoan(id) {
  const response = await api.post(`/loans/${id}/return`)
  return response.data
}
