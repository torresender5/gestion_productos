import api from '../lib/api'
import type { Product, CreateProductDto, UpdateProductDto, PaginatedResponse } from '../types'

export const productService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; category?: string }): Promise<PaginatedResponse<Product>> => {
    const { data } = await api.get<PaginatedResponse<Product>>('/products', { params })
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

  update: async (id: string, product: UpdateProductDto): Promise<Product> => {
    const { data } = await api.patch<Product>(`/products/${id}`, product)
    return data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`)
  },
}
