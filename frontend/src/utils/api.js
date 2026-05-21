import axios from 'axios'

const api = axios.create({
  baseURL: 'https://face-attendance-production-cbde.up.railway.app/api',
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
