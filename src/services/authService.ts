import api from '../lib/api'
import type { AuthResponse, LoginDto, RegisterDto } from '../types'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'USER'
  createdAt: string
}

export const authService = {
  login: async (dto: LoginDto): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', dto)
    if (data.accessToken) {
      localStorage.setItem('auth-token', data.accessToken)
    }
    return data
  },

  register: async (dto: RegisterDto): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/register', dto)
    if (data.accessToken) {
      localStorage.setItem('auth-token', data.accessToken)
    }
    return data
  },

  logout: () => {
    localStorage.removeItem('auth-token')
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/refresh', { refreshToken })
    if (data.accessToken) {
      localStorage.setItem('auth-token', data.accessToken)
    }
    return data
  },
}
