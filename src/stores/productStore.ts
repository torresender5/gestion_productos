import { create } from 'zustand'
import type { Product, CreateProductDto } from '../types'
import { productService } from '../services/productService'

interface ProductStore {
  products: Product[]
  loading: boolean
  error: string | null
  fetchProducts: () => Promise<void>
  addProduct: (product: CreateProductDto) => Promise<void>
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  updateStock: (id: string, quantity: number) => Promise<void>
}

export const useProductStore = create<ProductStore>()((set) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true, error: null })
    try {
      const response = await productService.getAll()
      set({ products: response.data, loading: false })
    } catch {
      set({ error: 'Error al cargar productos', loading: false })
    }
  },

  addProduct: async (product) => {
    set({ loading: true, error: null })
    try {
      const newProduct = await productService.create(product)
      set((state) => ({ products: [...state.products, newProduct], loading: false }))
    } catch {
      set({ error: 'Error al crear producto', loading: false })
      throw new Error('Error al crear producto')
    }
  },

  updateProduct: async (id, updates) => {
    set({ loading: true, error: null })
    try {
      const updated = await productService.update(id, updates)
      set((state) => ({
        products: state.products.map((p) => (p.id === id ? updated : p)),
        loading: false,
      }))
    } catch {
      set({ error: 'Error al actualizar producto', loading: false })
      throw new Error('Error al actualizar producto')
    }
  },

  deleteProduct: async (id) => {
    set({ loading: true, error: null })
    try {
      await productService.delete(id)
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
        loading: false,
      }))
    } catch {
      set({ error: 'Error al eliminar producto', loading: false })
      throw new Error('Error al eliminar producto')
    }
  },

  updateStock: async (id, quantity) => {
    set({ loading: true, error: null })
    try {
      const product = useProductStore.getState().products.find((p) => p.id === id)
      if (!product) throw new Error('Producto no encontrado')
      const updated = await productService.update(id, { stock: product.stock + quantity })
      set((state) => ({
        products: state.products.map((p) => (p.id === id ? updated : p)),
        loading: false,
      }))
    } catch {
      set({ error: 'Error al actualizar stock', loading: false })
      throw new Error('Error al actualizar stock')
    }
  },
}))
