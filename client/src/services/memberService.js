import api from './api'

export async function fetchMembers(query = {}) {
  const response = await api.get('/members', { params: query })
  return response.data
}

export async function getMember(id) {
  const response = await api.get(`/members/${id}`)
  return response.data
}

export async function createMember(payload) {
  const response = await api.post('/members', payload)
  return response.data
}

export async function updateMember(id, payload) {
  const response = await api.put(`/members/${id}`, payload)
  return response.data
}

export async function deleteMember(id) {
  const response = await api.delete(`/members/${id}`)
  return response.data
}
