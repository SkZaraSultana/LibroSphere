import api from './api'

export const CATEGORY_CHANGED_EVENT = 'librosphere:categories-changed'

export function notifyCategoriesChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(CATEGORY_CHANGED_EVENT))
  }
}

export async function fetchCategories() {
  const response = await api.get('/categories')
  const payload = response.data || {}
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload.categories)) return payload.categories
  if (Array.isArray(payload.data)) return payload.data
  return []
}

export async function createCategory(payload) {
  const response = await api.post('/categories', payload)
  return response.data
}

export async function updateCategory(id, payload) {
  const response = await api.put(`/categories/${id}`, payload)
  return response.data
}

export async function deleteCategory(id) {
  const response = await api.delete(`/categories/${id}`)
  return response.data
}
