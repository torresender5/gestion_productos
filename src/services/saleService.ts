import api from '../lib/api'
import type { Sale, CreateSaleDto, Invoice, PaginatedResponse } from '../types'

export const saleService = {
  getAll: async (params?: { page?: number; limit?: number; paymentStatus?: 'PAID' | 'PENDING' }): Promise<PaginatedResponse<Sale>> => {
    const { data } = await api.get<PaginatedResponse<Sale>>('/sales', { params })
    return data
  },

  getById: async (id: string): Promise<Sale> => {
    const { data } = await api.get<Sale>(`/sales/${id}`)
    return data
  },

  create: async (sale: CreateSaleDto): Promise<Sale> => {
    const { data } = await api.post<Sale>('/sales', sale)
    return data
  },

  updatePaymentStatus: async (id: string): Promise<Sale> => {
    const { data } = await api.patch<Sale>(`/sales/${id}/payment`)
    return data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/sales/${id}`)
  },
}

export const invoiceService = {
  getAll: async (params?: { page?: number; limit?: number; status?: 'PAID' | 'PENDING' }): Promise<PaginatedResponse<Invoice>> => {
    const { data } = await api.get<PaginatedResponse<Invoice>>('/invoices', { params })
    return data
  },

  getById: async (id: string): Promise<Invoice> => {
    const { data } = await api.get<Invoice>(`/invoices/${id}`)
    return data
  },

  generateFromSale: async (saleId: string): Promise<Invoice> => {
    const { data } = await api.post<Invoice>(`/invoices/from-sale/${saleId}`)
    return data
  },

  updateStatus: async (id: string, status: 'PAID' | 'PENDING'): Promise<Invoice> => {
    const { data } = await api.patch<Invoice>(`/invoices/${id}/status`, { status })
    return data
  },
}
