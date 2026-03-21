import api from '../lib/api'
import type { Client } from '../types'

export type CreateClientDto = Omit<Client, 'id' | 'createdAt'>

export const clientService = {
  getAll: async (): Promise<Client[]> => {
    const { data } = await api.get<Client[]>('/client')
    return data
  },

  getById: async (id: string): Promise<Client> => {
    const { data } = await api.get<Client>(`/client/${id}`)
    return data
  },

  create: async (client: CreateClientDto): Promise<Client> => {
    const { data } = await api.post<Client>('/client/create', client)
    return data
  },

  update: async (id: string, client: Partial<Client>): Promise<Client> => {
    const { data } = await api.patch<Client>(`/client/${id}`, client)
    return data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/clients/${id}`)
  },
}
