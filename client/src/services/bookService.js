import api from './api'

function normalizeBooksPayload(payload) {
  const source = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.books)
        ? payload.books
        : Array.isArray(payload?.items)
          ? payload.items
          : []

  const books = Array.isArray(source) ? source : []

  return {
    ...(payload && typeof payload === 'object' ? payload : {}),
    data: books,
    books,
    items: books,
  }
}

export async function fetchBooks(query = {}) {
  const response = await api.get('/books', { params: query })
  return normalizeBooksPayload(response.data)
}

export async function getBook(id) {
  const response = await api.get(`/books/${id}`)
  return response.data
}

export async function createBook(payload) {
  const response = await api.post('/books', payload)
  return response.data
}

export async function updateBook(id, payload) {
  const response = await api.put(`/books/${id}`, payload)
  return response.data
}

export async function deleteBook(id) {
  const response = await api.delete(`/books/${id}`)
  return response.data
}
