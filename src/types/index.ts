export interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'USER'
  createdAt: Date
  updatedAt: Date
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'USER'
}

export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  name: string
  email: string
  password: string
}

export interface Product {
  id: string
  name: string
  description: string
  sku: string
  category: string
  purchasePrice: number
  salePrice: number
  stock: number
  createdAt: Date
  updatedAt: Date
}

export interface CreateProductDto {
  name: string
  description?: string
  sku: string
  category: string
  purchasePrice: number
  salePrice: number
  stock?: number
}

export type UpdateProductDto = Partial<CreateProductDto>

export interface Client {
  id: string
  name: string
  email: string
  phone: string
  address: string
  document: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateClientDto {
  name: string
  email: string
  phone: string
  address: string
  document: string
}

export type UpdateClientDto = Partial<CreateClientDto>

export interface Supplier {
  id: string
  name: string
  document: string
  email: string
  phone: string
  address: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateSupplierDto {
  name: string
  document: string
  email: string
  phone: string
  address: string
}

export type UpdateSupplierDto = Partial<CreateSupplierDto>

export interface PurchaseItem {
  id?: string
  productId: string
  productName?: string
  quantity: number
  unitPrice: number
  subtotal?: number
}

export interface Purchase {
  id: string
  supplierId: string
  supplier?: { id: string; name: string }
  date: Date
  items: PurchaseItem[]
  total: number
  paymentStatus: 'PAID' | 'PENDING'
  createdAt: Date
  updatedAt: Date
}

export interface CreatePurchaseDto {
  supplierId: string
  items: {
    productId: string
    quantity: number
    unitPrice: number
  }[]
  paymentStatus?: 'PAID' | 'PENDING'
}

export interface SaleItem {
  id?: string
  productId: string
  productName?: string
  quantity: number
  unitPrice: number
  subtotal?: number
}

export interface Sale {
  id: string
  clientId: string
  client?: { id: string; name: string }
  date: Date
  items: SaleItem[]
  subtotal: number
  tax: number
  total: number
  paymentStatus: 'PAID' | 'PENDING'
  createdAt: Date
  updatedAt: Date
}

export interface CreateSaleDto {
  clientId: string
  items: {
    productId: string
    quantity: number
    unitPrice: number
  }[]
  paymentStatus?: 'PAID' | 'PENDING'
}

export interface Invoice {
  id: string
  invoiceNumber: string
  saleId: string
  clientId: string
  client?: { id: string; name: string; document: string; address: string }
  clientName?: string
  clientDocument?: string
  clientAddress?: string
  date: Date
  items: SaleItem[]
  subtotal: number
  tax: number
  total: number
  status: 'PAID' | 'PENDING'
  createdAt: Date
  updatedAt: Date
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiError {
  statusCode: number
  message: string | string[]
  error: string
}
