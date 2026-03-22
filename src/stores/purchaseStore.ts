import { create } from 'zustand'
import type { Purchase, CreatePurchaseDto } from '../types'
import { purchaseService } from '../services/purchaseService'
import { useProductStore } from './productStore'

interface PurchaseStore {
  purchases: Purchase[]
  loading: boolean
  error: string | null
  fetchPurchases: () => Promise<void>
  addPurchase: (purchase: CreatePurchaseDto) => Promise<void>
  updatePurchasePaymentStatus: (id: string) => Promise<void>
}

export const usePurchaseStore = create<PurchaseStore>()((set) => ({
  purchases: [],
  loading: false,
  error: null,

  fetchPurchases: async () => {
    set({ loading: true, error: null })
    try {
      const response = await purchaseService.getAll()
      set({ purchases: response.data, loading: false })
    } catch {
      set({ error: 'Error al cargar compras', loading: false })
    }
  },

  addPurchase: async (purchase) => {
    set({ loading: true, error: null })
    try {
      const newPurchase = await purchaseService.create(purchase)
      const { updateStock } = useProductStore.getState()
      for (const item of purchase.items) {
        await updateStock(item.productId, item.quantity)
      }
      set((state) => ({ purchases: [...state.purchases, newPurchase], loading: false }))
    } catch {
      set({ error: 'Error al registrar compra', loading: false })
      throw new Error('Error al registrar compra')
    }
  },

  updatePurchasePaymentStatus: async (id) => {
    set({ loading: true, error: null })
    try {
      const updated = await purchaseService.updatePaymentStatus(id)
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
