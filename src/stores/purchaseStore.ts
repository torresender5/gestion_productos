import { create } from 'zustand'
import type { Purchase, PurchaseItem } from '../types'
import { purchaseService } from '../services/purchaseService'
import { useProductStore } from './productStore'

interface PurchaseStore {
  purchases: Purchase[]
  loading: boolean
  error: string | null
  fetchPurchases: () => Promise<void>
  addPurchase: (supplierId: string, supplierName: string, date: string, items: PurchaseItem[], paymentStatus: 'paid' | 'pending') => Promise<void>
  updatePurchasePaymentStatus: (id: string, status: 'paid' | 'pending') => Promise<void>
}

export const usePurchaseStore = create<PurchaseStore>()((set) => ({
  purchases: [],
  loading: false,
  error: null,

  fetchPurchases: async () => {
    set({ loading: true, error: null })
    try {
      const purchases = await purchaseService.getAll()
      set({ purchases, loading: false })
    } catch {
      set({ error: 'Error al cargar compras', loading: false })
    }
  },

  addPurchase: async (supplierId, supplierName, date, items, paymentStatus) => {
    set({ loading: true, error: null })
    try {
      const newPurchase = await purchaseService.create({
        supplierId,
        supplier: supplierName,
        date,
        items,
        paymentStatus,
      })
      // Actualizar stock local de cada producto
      const { updateStock } = useProductStore.getState()
      for (const item of items) {
        await updateStock(item.productId, item.quantity)
      }
      set((state) => ({ purchases: [...state.purchases, newPurchase], loading: false }))
    } catch {
      set({ error: 'Error al registrar compra', loading: false })
      throw new Error('Error al registrar compra')
    }
  },

  updatePurchasePaymentStatus: async (id, status) => {
    set({ loading: true, error: null })
    try {
      const updated = await purchaseService.updatePaymentStatus(id, status)
      set((state) => ({
        purchases: state.purchases.map((p) => (p.id === id ? updated : p)),
        loading: false,
      }))
    } catch {
      set({ error: 'Error al actualizar estado de pago', loading: false })
      throw new Error('Error al actualizar estado de pago')
    }
  },
}))
