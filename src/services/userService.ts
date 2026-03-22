import api from '../lib/api'
import type { User, PaginatedResponse } from '../types'

export const userService = {
  getAll: async (): Promise<PaginatedResponse<User>> => {
    const { data } = await api.get<PaginatedResponse<User>>('/auth/users')
    return data
  },

  getById: async (id: string): Promise<User> => {
    const { data } = await api.get<User>(`/auth/users/${id}`)
    return data
  },

  update: async (id: string, updates: { name?: string; email?: string; role?: 'ADMIN' | 'USER'; password?: string }): Promise<User> => {
    const { data } = await api.patch<User>(`/auth/users/${id}`, updates)
    return data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/auth/users/${id}`)
  },
}
