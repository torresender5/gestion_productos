export interface Product {
  id: string
  name: string
  description: string
  sku: string
  category: string
  purchasePrice: number
  salePrice: number
  stock: number
  createdAt: string
}

export interface Client {
  id: string
  name: string
  email: string
  phone: string
  address: string
  document: string // NIT o cédula
  createdAt: string
}

export interface Supplier {
  id: string
  name: string
  document: string // NIT o cédula
  email: string
  phone: string
  address: string
  createdAt: string
}

export interface PurchaseItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface Purchase {
  id: string
  supplierId: string
  supplier: string
  date: string
  items: PurchaseItem[]
  total: number
  paymentStatus: 'paid' | 'pending'
  createdAt: string
}

export interface SaleItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface Sale {
  id: string
  clientId: string
  clientName: string
  date: string
  items: SaleItem[]
  subtotal: number
  tax: number
  total: number
  paymentStatus: 'paid' | 'pending'
  createdAt: string
}

export interface Invoice {
  id: string
  invoiceNumber: string
  saleId: string
  clientId: string
  clientName: string
  clientDocument: string
  clientAddress: string
  date: string
  items: SaleItem[]
  subtotal: number
  tax: number
  total: number
  status: 'paid' | 'pending'
  createdAt: string
}
