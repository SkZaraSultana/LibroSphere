import api from './api'

export async function fetchLibrarySettings() {
  const response = await api.get('/library-settings')
  return response.data
}

export async function updateLibrarySettings(payload) {
  const response = await api.put('/library-settings', payload)
  return response.data
}
