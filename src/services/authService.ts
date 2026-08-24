import api from '../lib/api'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
  createdAt: string
}

export interface LoginResponse {
  access_token?: string
  token?: string
}

export interface RegisterDto {
  user: string
  email: string
  password: string
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split('.')[1]
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json)
  } catch {
    return null
  }
}

function userFromToken(token: string): AuthUser | null {
  const payload = decodeJwtPayload(token)
  if (!payload) return null
  return {
    id: String(payload.sub ?? ''),
    name: String(payload.name ?? ''),
    email: String(payload.email ?? ''),
    role: 'user',
    createdAt: '',
  }
}

export const authService = {
  login: async (email: string, password: string): Promise<{ user: AuthUser; token: string }> => {
    const { data } = await api.post<LoginResponse>('/auth/login', { email, password })
    const token = data.access_token || data.token
    if (!token) throw new Error('No se recibió token')
    localStorage.setItem('auth-token', token)
    const user = userFromToken(token)
    if (!user) throw new Error('Token inválido')
    return { user, token }
  },

  register: async (dto: RegisterDto): Promise<{ user: AuthUser; token: string }> => {
    await api.post('/auth/register', dto)
    const { data } = await api.post<LoginResponse>('/auth/login', {
      email: dto.email,
      password: dto.password,
    })
    const token = data.access_token || data.token
    if (!token) throw new Error('No se recibió token')
    localStorage.setItem('auth-token', token)
    const user = userFromToken(token)
    if (!user) throw new Error('Token inválido')
    return { user, token }
  },

  logout: () => {
    localStorage.removeItem('auth-token')
  },

  getTokenFromStorage: (): AuthUser | null => {
    const token = localStorage.getItem('auth-token')
    if (!token) return null
    return userFromToken(token)
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
