import api from '../lib/api'
import type { Supplier, CreateSupplierDto, UpdateSupplierDto, PaginatedResponse } from '../types'

export const supplierService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<Supplier>> => {
    const { data } = await api.get<PaginatedResponse<Supplier>>('/suppliers', { params })
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

  update: async (id: string, supplier: UpdateSupplierDto): Promise<Supplier> => {
    const { data } = await api.patch<Supplier>(`/suppliers/${id}`, supplier)
    return data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/suppliers/${id}`)
  },
}
