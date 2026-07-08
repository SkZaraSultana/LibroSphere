import api from './api'

export async function fetchProfile() {
  const response = await api.get('/auth/me')
  return response.data.user || response.data
}

export async function updateProfile(payload) {
  const response = await api.put('/auth/me', payload)
  return response.data.user || response.data
}
