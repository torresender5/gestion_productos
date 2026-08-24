import { create } from 'zustand'
import type { Product, PaginationMeta } from '../types'
import { productService, type CreateProductDto } from '../services/productService'

const emptyMeta: PaginationMeta = { total: 0, page: 1, limit: 10, totalPages: 1 }

interface ProductStore {
  products: Product[]
  meta: PaginationMeta
  loading: boolean
  error: string | null
  page: number
  limit: number
  search: string
  categoryFilter: string
  fetchProducts: () => Promise<void>
  fetchAllProducts: () => Promise<void>
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  setSearch: (search: string) => void
  setCategoryFilter: (category: string) => void
  addProduct: (product: CreateProductDto) => Promise<void>
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  updateStock: (id: string, quantity: number) => Promise<void>
}

export const useProductStore = create<ProductStore>()((set, get) => ({
  products: [],
  meta: emptyMeta,
  loading: false,
  error: null,
  page: 1,
  limit: 10,
  search: '',
  categoryFilter: '',

  fetchProducts: async () => {
    const { page, limit, search, categoryFilter } = get()
    set({ loading: true, error: null })
    try {
      const { data, meta } = await productService.getAll({
        page,
        limit,
        search: search || undefined,
        category: categoryFilter || undefined,
      })
      set({ products: data, meta, loading: false })
    } catch {
      set({ error: 'Error al cargar productos', loading: false })
    }
  },

  fetchAllProducts: async () => {
    set({ loading: true, error: null })
    try {
      const first = await productService.getAll({ page: 1, limit: 100 })
      let all = first.data
      for (let p = 2; p <= first.meta.totalPages; p++) {
        const next = await productService.getAll({ page: p, limit: 100 })
        all = all.concat(next.data)
      }
      set({ products: all, loading: false })
    } catch {
      set({ error: 'Error al cargar productos', loading: false })
    }
  },

  setPage: (page) => {
    set({ page })
    get().fetchProducts()
  },

  setLimit: (limit) => {
    set({ limit, page: 1 })
    get().fetchProducts()
  },

  setSearch: (search) => {
    set({ search, page: 1 })
    get().fetchProducts()
  },

  setCategoryFilter: (categoryFilter) => {
    set({ categoryFilter, page: 1 })
    get().fetchProducts()
  },

  addProduct: async (product) => {
    set({ loading: true, error: null })
    try {
      await productService.create(product)
      set({ loading: false })
      await get().fetchProducts()
    } catch (error) {
      set({ error: 'Error al crear producto', loading: false })
      throw error
    }
  },

  updateProduct: async (id, updates) => {
    set({ loading: true, error: null })
    try {
      await productService.update(id, updates)
      set({ loading: false })
      await get().fetchProducts()
    } catch (error) {
      set({ error: 'Error al actualizar producto', loading: false })
      throw error
    }
  },

  deleteProduct: async (id) => {
    set({ loading: true, error: null })
    try {
      await productService.delete(id)
      set({ loading: false })
      await get().fetchProducts()
    } catch (error) {
      set({ error: 'Error al eliminar producto', loading: false })
      throw error
    }
  },

  updateStock: async (id, quantity) => {
    set({ loading: true, error: null })
    try {
      const product = get().products.find((p) => p.id === id)
      if (!product) throw new Error('Producto no encontrado')
      await productService.update(id, { stock: product.stock + quantity })
      set({ loading: false })
      await get().fetchProducts()
    } catch (error) {
      set({ error: 'Error al actualizar stock', loading: false })
      throw error
    }
  },
}))
