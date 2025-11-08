import axios from 'axios'
import type { LoginRequest, LoginResponse, RegisterRequest, User } from '../types'

// Production'da relative path kullan, development'ta localhost
const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' ? '' : 'http://localhost:8000')

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const authData = localStorage.getItem('auth-storage')
    if (authData) {
      const { state } = JSON.parse(authData)
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Auth API
export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    // FastAPI OAuth2PasswordRequestForm expects form data
    const formData = new FormData()
    formData.append('username', data.email) // OAuth2 uses 'username' field
    formData.append('password', data.password)
    
    const response = await api.post<LoginResponse>('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    return response.data
  },

  register: async (data: RegisterRequest): Promise<User> => {
    const response = await api.post<User>('/auth/register', data)
    return response.data
  },

  getMe: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me')
    return response.data
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
  },
}

export default api
