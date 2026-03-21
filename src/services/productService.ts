import api from '../lib/api'
import type { Product } from '../types'

export type CreateProductDto = Omit<Product, 'id' | 'createdAt'>

export const productService = {
  getAll: async (): Promise<Product[]> => {
    const { data } = await api.get<Product[]>('/products')
    return data
  },

  getById: async (id: string): Promise<Product> => {
    const { data } = await api.get<Product>(`/products/${id}`)
    return data
  },

  create: async (product: CreateProductDto): Promise<Product> => {
    const { data } = await api.post<Product>('/products', product)
    return data
  },

  update: async (id: string, product: Partial<Product>): Promise<Product> => {
    const { data } = await api.patch<Product>(`/products/${id}`, product)
    return data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`)
  },
}
