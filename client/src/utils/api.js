import axios from 'axios'

// In dev: VITE_API_URL is empty → baseURL is "" → Vite proxy catches /api/*
// In prod: VITE_API_URL is your Render URL → requests go there directly
const API_BASE_URL = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
})

// Response interceptor — unwrap .data on success, surface .message on error
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong'
    return Promise.reject(new Error(message))
  }
)

export default api
