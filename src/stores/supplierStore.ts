import { create } from 'zustand'
import type { Supplier } from '../types'
import { supplierService, type CreateSupplierDto } from '../services/supplierService'

interface SupplierStore {
  suppliers: Supplier[]
  loading: boolean
  error: string | null
  fetchSuppliers: () => Promise<void>
  addSupplier: (supplier: CreateSupplierDto) => Promise<void>
  updateSupplier: (id: string, supplier: Partial<Supplier>) => Promise<void>
  deleteSupplier: (id: string) => Promise<void>
}

export const useSupplierStore = create<SupplierStore>()((set) => ({
  suppliers: [],
  loading: false,
  error: null,

  fetchSuppliers: async () => {
    set({ loading: true, error: null })
    try {
      const suppliers = await supplierService.getAll()
      set({ suppliers, loading: false })
    } catch {
      set({ error: 'Error al cargar proveedores', loading: false })
    }
  },

  addSupplier: async (supplier) => {
    set({ loading: true, error: null })
    try {
      const newSupplier = await supplierService.create(supplier)
      set((state) => ({ suppliers: [...state.suppliers, newSupplier], loading: false }))
    } catch {
      set({ error: 'Error al crear proveedor', loading: false })
      throw new Error('Error al crear proveedor')
    }
  },

  updateSupplier: async (id, updates) => {
    set({ loading: true, error: null })
    try {
      const updated = await supplierService.update(id, updates)
      set((state) => ({
        suppliers: state.suppliers.map((s) => (s.id === id ? updated : s)),
        loading: false,
      }))
    } catch {
      set({ error: 'Error al actualizar proveedor', loading: false })
      throw new Error('Error al actualizar proveedor')
    }
  },

  deleteSupplier: async (id) => {
    set({ loading: true, error: null })
    try {
      await supplierService.delete(id)
      set((state) => ({
        suppliers: state.suppliers.filter((s) => s.id !== id),
        loading: false,
      }))
    } catch {
      set({ error: 'Error al eliminar proveedor', loading: false })
      throw new Error('Error al eliminar proveedor')
    }
  },
}))
