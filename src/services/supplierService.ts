import api from '../lib/api'
import type { Supplier } from '../types'

export type CreateSupplierDto = Omit<Supplier, 'id' | 'createdAt'>

export const supplierService = {
  getAll: async (): Promise<Supplier[]> => {
    const { data } = await api.get<Supplier[]>('/suppliers')
    return data
  },

  getById: async (id: string): Promise<Supplier> => {
    const { data } = await api.get<Supplier>(`/suppliers/${id}`)
    return data
  },

  create: async (supplier: CreateSupplierDto): Promise<Supplier> => {
    const { data } = await api.post<Supplier>('/suppliers', supplier)
    return data
  },

  update: async (id: string, supplier: Partial<Supplier>): Promise<Supplier> => {
    const { data } = await api.patch<Supplier>(`/suppliers/${id}`, supplier)
    return data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/suppliers/${id}`)
  },
}
