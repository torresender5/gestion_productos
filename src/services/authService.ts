import api from '../lib/api'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
  createdAt: string
}

export interface LoginResponse {
  user: AuthUser
  token: string
}

export interface RegisterDto {
  user?: string
  name?: string
  email: string
  password: string
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>('/auth/login', { email, password })
    if (data.token) {
      localStorage.setItem('auth-token', data.token)
    }
    return data
  },

  register: async (dto: RegisterDto): Promise<LoginResponse> => {
    try {
      dto.user = dto.name
      const { data } = await api.post<LoginResponse>('/auth/register', dto)
      console.log(data)
      if (data.token) {
        localStorage.setItem('auth-token', data.token)
      }
      return data
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  },

  logout: () => {
    localStorage.removeItem('auth-token')
  },

  getMe: async (): Promise<AuthUser> => {
    const { data } = await api.get<AuthUser>('/auth/me')
    return data
  },

  getUsers: async (): Promise<AuthUser[]> => {
    const { data } = await api.get<AuthUser[]>('/users')
    return data
  },

  updateUser: async (id: string, updates: Partial<AuthUser & { password: string }>): Promise<AuthUser> => {
    const { data } = await api.patch<AuthUser>(`/users/${id}`, updates)
    return data
  },

  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`)
  },
}
