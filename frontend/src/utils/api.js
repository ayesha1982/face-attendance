import axios from 'axios'

const isProduction = import.meta.env.MODE === 'production'
const apiBaseURL = isProduction 
  ? 'https://face-attendance-production-cbde.up.railway.app/api'
  : '/api'

const api = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
  timeout: 30000,
})

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
