import { create } from 'zustand'
import type { Sale, CreateSaleDto, Invoice } from '../types'
import { saleService, invoiceService } from '../services/saleService'
import { useProductStore } from './productStore'

interface SaleStore {
  sales: Sale[]
  invoices: Invoice[]
  loading: boolean
  error: string | null
  fetchSales: () => Promise<void>
  fetchInvoices: () => Promise<void>
  addSale: (sale: CreateSaleDto) => Promise<Sale>
  updateSalePaymentStatus: (id: string) => Promise<void>
  updateInvoiceStatus: (id: string, status: 'PAID' | 'PENDING') => Promise<void>
}

export const useSaleStore = create<SaleStore>()((set) => ({
  sales: [],
  invoices: [],
  loading: false,
  error: null,

  fetchSales: async () => {
    set({ loading: true, error: null })
    try {
      const response = await saleService.getAll()
      set({ sales: response.data, loading: false })
    } catch {
      set({ error: 'Error al cargar ventas', loading: false })
    }
  },

  fetchInvoices: async () => {
    set({ loading: true, error: null })
    try {
      const response = await invoiceService.getAll()
      set({ invoices: response.data, loading: false })
    } catch {
      set({ error: 'Error al cargar facturas', loading: false })
    }
  },

  addSale: async (sale) => {
    set({ loading: true, error: null })
    try {
      const newSale = await saleService.create(sale)
      const { updateStock } = useProductStore.getState()
      for (const item of sale.items) {
        await updateStock(item.productId, -item.quantity)
      }
      set((state) => ({
        sales: [...state.sales, newSale],
        loading: false,
      }))
      return newSale
    } catch {
      set({ error: 'Error al registrar venta', loading: false })
      throw new Error('Error al registrar venta')
    }
  },

  updateSalePaymentStatus: async (id) => {
    set({ loading: true, error: null })
    try {
      const updated = await saleService.updatePaymentStatus(id)
      set((state) => ({
        sales: state.sales.map((s) => (s.id === id ? updated : s)),
        loading: false,
      }))
    } catch {
      set({ error: 'Error al actualizar estado de pago', loading: false })
      throw new Error('Error al actualizar estado de pago')
    }
  },

  updateInvoiceStatus: async (id, status) => {
    set({ loading: true, error: null })
    try {
      const updated = await invoiceService.updateStatus(id, status)
      set((state) => ({
        invoices: state.invoices.map((inv) => (inv.id === id ? updated : inv)),
        loading: false,
      }))
    } catch {
      set({ error: 'Error al actualizar factura', loading: false })
      throw new Error('Error al actualizar factura')
    }
  },
}))
