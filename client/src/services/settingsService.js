import api from './api'

export async function fetchSettings() {
  const response = await api.get('/settings')
  return response.data
}

export async function updateSettings(payload) {
  const response = await api.put('/settings', payload)
  return response.data
}
