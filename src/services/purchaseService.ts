import api from '../lib/api'
import type { Purchase, CreatePurchaseDto, PaginatedResponse } from '../types'

export const purchaseService = {
  getAll: async (params?: { page?: number; limit?: number; paymentStatus?: 'PAID' | 'PENDING' }): Promise<PaginatedResponse<Purchase>> => {
    const { data } = await api.get<PaginatedResponse<Purchase>>('/purchases', { params })
    return data
  },

  getById: async (id: string): Promise<Purchase> => {
    const { data } = await api.get<Purchase>(`/purchases/${id}`)
    return data
  },

  create: async (purchase: CreatePurchaseDto): Promise<Purchase> => {
    const { data } = await api.post<Purchase>('/purchases', purchase)
    return data
  },

  updatePaymentStatus: async (id: string): Promise<Purchase> => {
    const { data } = await api.patch<Purchase>(`/purchases/${id}/payment`)
    return data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/purchases/${id}`)
  },
}
