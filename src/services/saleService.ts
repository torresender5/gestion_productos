import api from '../lib/api'
import type { Sale, SaleItem, Invoice } from '../types'

export interface CreateSaleDto {
  clientId: string
  date: string
  items: SaleItem[]
  paymentStatus: 'paid' | 'pending'
}

export interface SaleWithInvoice {
  sale: Sale
  invoice: Invoice
}

export const saleService = {
  getAll: async (): Promise<Sale[]> => {
    const { data } = await api.get<Sale[]>('/sales')
    return data
  },

  create: async (sale: CreateSaleDto): Promise<SaleWithInvoice> => {
    const { data } = await api.post<SaleWithInvoice>('/sales', sale)
    return data
  },

  updatePaymentStatus: async (id: string, status: 'paid' | 'pending'): Promise<Sale> => {
    const { data } = await api.patch<Sale>(`/sales/${id}`, { paymentStatus: status })
    return data
  },
}

export const invoiceService = {
  getAll: async (): Promise<Invoice[]> => {
    const { data } = await api.get<Invoice[]>('/invoices')
    return data
  },

  updateStatus: async (id: string, status: 'paid' | 'pending'): Promise<Invoice> => {
    const { data } = await api.patch<Invoice>(`/invoices/${id}`, { status })
    return data
  },
}
