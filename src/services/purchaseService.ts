import api from '../lib/api'
import type { Purchase, PurchaseItem } from '../types'

export interface CreatePurchaseDto {
  supplierId: string
  supplier: string
  date: string
  items: PurchaseItem[]
  paymentStatus: 'paid' | 'pending'
}

export const purchaseService = {
  getAll: async (): Promise<Purchase[]> => {
    const { data } = await api.get<Purchase[]>('/purchases')
    return data
  },

  create: async (purchase: CreatePurchaseDto): Promise<Purchase> => {
    const { data } = await api.post<Purchase>('/purchases', purchase)
    return data
  },

  updatePaymentStatus: async (id: string, status: 'paid' | 'pending'): Promise<Purchase> => {
    const { data } = await api.patch<Purchase>(`/purchases/${id}`, { paymentStatus: status })
    return data
  },
}
