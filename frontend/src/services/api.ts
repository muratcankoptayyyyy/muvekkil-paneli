import axios from 'axios'
import { 
  LoginRequest, 
  RegisterRequest, 
  LoginResponse, 
  User, 
  Case, 
  CaseCreate, 
  CaseUpdate,
  TimelineEvent
} from '../types'

// Production'da Fly.io URL kullan, development'ta localhost
const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' ? 'https://muvekkil-paneli.fly.dev' : 'http://localhost:8000')

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
  login: async (data: LoginRequest & { otp_code?: string }): Promise<LoginResponse> => {
    // FastAPI OAuth2PasswordRequestForm expects form data
    const formData = new FormData()
    formData.append('username', data.email) // OAuth2 uses 'username' field
    formData.append('password', data.password)
    if (data.otp_code) {
      formData.append('otp_code', data.otp_code)
    }
    
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

  setup2FA: async (): Promise<{ secret: string; qr_code: string; provisioning_uri: string }> => {
    const response = await api.post('/auth/2fa/setup')
    return response.data
  },

  verify2FA: async (code: string): Promise<{ message: string }> => {
    const formData = new FormData()
    formData.append('code', code)
    const response = await api.post('/auth/2fa/verify', formData)
    return response.data
  },

  disable2FA: async (code: string): Promise<{ message: string }> => {
    const formData = new FormData()
    formData.append('code', code)
    const response = await api.post('/auth/2fa/disable', formData)
    return response.data
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put<User>('/auth/me', data)
    return response.data
  },
}

// Admin API
export interface ClientCreateRequest {
  email?: string
  full_name: string
  phone?: string
  user_type: 'individual' | 'corporate'
  tc_kimlik?: string
  tax_number?: string
  company_name?: string
  address?: string
  bank_account_info?: string
}

export const adminApi = {
  createClient: async (data: ClientCreateRequest): Promise<{ user: User; temp_password: string }> => {
    const response = await api.post('/admin/clients', data)
    return response.data
  },
}

// Cases API
export const casesApi = {
  getCase: async (id: number) => {
    const response = await api.get<Case>(`/cases/${id}`)
    return response.data
  },

  getCaseTimeline: async (id: number) => {
    const response = await api.get<TimelineEvent[]>(`/cases/${id}/timeline`)
    return response.data
  },

  createCase: async (data: CaseCreate) => {
    const response = await api.post<Case>('/cases', data)
    return response.data
  },

  updateCase: async (id: number, data: CaseUpdate) => {
    const response = await api.put<Case>(`/cases/${id}`, data)
    return response.data
  },

  deleteCase: async (id: number) => {
    await api.delete(`/cases/${id}`)
  },
}

export default api
