import axios from 'axios'
import { useUserStore } from '../stores/userStore'

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add JWT token to all requests
apiClient.interceptors.request.use(
  (config: any) => {
    const token = useUserStore.getState().token

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error: any) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle 401 errors (unauthorized)
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error: any) => {
    if (error.response?.status === 401) {
      // Clear user data and redirect to login
      useUserStore.getState().clearUser()

      // Only redirect if not already on login/register pages
      if (
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/register'
      ) {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

// Type definitions for API responses
export interface ApiError {
  message: string
  error?: string
}

export interface LoginResponse {
  token: string
  user: {
    id: string
    username: string
    email: string
    tokenBalance: number
    level: number
    tutorialCompleted: boolean
    taskBoardUnlocked: boolean
    compositeUnlocked: boolean
    createdAt: string
  }
}

export interface RegisterResponse {
  token: string
  user: {
    id: string
    username: string
    email: string
    tokenBalance: number
    level: number
    tutorialCompleted: boolean
    taskBoardUnlocked: boolean
    compositeUnlocked: boolean
    createdAt: string
  }
}

export interface UserResponse {
  id: string
  username: string
  email: string
  tokenBalance: number
  level: number
  tutorialCompleted: boolean
  taskBoardUnlocked: boolean
  compositeUnlocked: boolean
  createdAt: string
}

// API functions
export const authApi = {
  login: async (credentials: { login: string; password: string }) => {
    const response = await apiClient.post<LoginResponse>('/api/auth/login', credentials)
    return response.data
  },

  register: async (data: { username: string; email: string; password: string }) => {
    const response = await apiClient.post<RegisterResponse>('/api/auth/register', data)
    return response.data
  },

  getCurrentUser: async () => {
    const response = await apiClient.get<UserResponse>('/api/auth/me')
    return response.data
  },
}

export default apiClient
