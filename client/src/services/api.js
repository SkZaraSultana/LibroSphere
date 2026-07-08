import axios from 'axios'

// Axios instance configured for the API. Uses Vite env var `VITE_API_BASE_URL`.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export default api
