import api from '../lib/api'
import type { Client, CreateClientDto, UpdateClientDto, PaginatedResponse } from '../types'

export const clientService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<Client>> => {
    const { data } = await api.get<PaginatedResponse<Client>>('/clients', { params })
    return data
  },

  getById: async (id: string): Promise<Client> => {
    const { data } = await api.get<Client>(`/clients/${id}`)
    return data
  },

  create: async (client: CreateClientDto): Promise<Client> => {
    const { data } = await api.post<Client>('/clients', client)
    return data
  },

  update: async (id: string, client: UpdateClientDto): Promise<Client> => {
    const { data } = await api.patch<Client>(`/clients/${id}`, client)
    return data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/clients/${id}`)
  },
}
