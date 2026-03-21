import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, ShoppingCart, ShoppingBag, Loader2 } from 'lucide-react'
import { useProductStore } from '../stores/productStore'
import { useCartStore } from '../stores/cartStore'
import { formatCurrency, CATEGORIES } from '../lib/utils'
import Modal from '../components/Modal'
import CartPanel from '../components/CartPanel'
import type { Product } from '../types'

const emptyForm = {
  name: '',
  description: '',
  sku: '',
  category: CATEGORIES[0],
  purchasePrice: 0,
  salePrice: 0,
  stock: 0,
}

export default function Products() {
  const { products, loading, error, fetchProducts, addProduct, updateProduct, deleteProduct } = useProductStore()
  const cartStore = useCartStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const cartItemCount = cartStore.items.reduce((sum, i) => sum + i.quantity, 0)

  const addToCart = (product: Product) => {
    cartStore.addItem({
      productId: product.id,
      productName: product.name,
      unitPrice: product.salePrice,
      maxStock: product.stock,
    })
  }

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !categoryFilter || p.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const openCreate = () => {
    setForm(emptyForm)
    setEditingId(null)
    setIsModalOpen(true)
  }

  const openEdit = (product: Product) => {
    setForm({
      name: product.name,
      description: product.description,
      sku: product.sku,
      category: product.category,
      purchasePrice: product.purchasePrice,
      salePrice: product.salePrice,
      stock: product.stock,
    })
    setEditingId(product.id)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await updateProduct(editingId, form)
      } else {
        await addProduct(form)
      }
      setIsModalOpen(false)
    } catch {
      // error se maneja en el store
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Productos</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsCartOpen(true)} className="relative flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">Carrito</span>
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Nuevo Producto
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas las categorías</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      {loading && products.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-500">Cargando productos...</span>
        </div>
      ) : (
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-medium text-gray-600">Nombre</th>
              <th className="text-left p-4 font-medium text-gray-600">SKU</th>
              <th className="text-left p-4 font-medium text-gray-600">Categoría</th>
              <th className="text-right p-4 font-medium text-gray-600">P. Compra</th>
              <th className="text-right p-4 font-medium text-gray-600">P. Venta</th>
              <th className="text-right p-4 font-medium text-gray-600">Stock</th>
              <th className="text-right p-4 font-medium text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-500">No hay productos</td></tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-4 font-medium">{p.name}</td>
                  <td className="p-4 text-gray-500">{p.sku}</td>
                  <td className="p-4"><span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">{p.category}</span></td>
                  <td className="p-4 text-right">{formatCurrency(p.purchasePrice)}</td>
                  <td className="p-4 text-right">{formatCurrency(p.salePrice)}</td>
                  <td className="p-4 text-right">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      p.stock === 0 ? 'bg-red-100 text-red-700' : p.stock < 10 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                    }`}>{p.stock}</span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      {p.stock > 0 && (
                        <button onClick={() => addToCart(p)} title="Agregar al carrito" className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500">
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteProduct(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar Producto' : 'Nuevo Producto'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre *</label>
              <input required type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SKU *</label>
              <input required type="text" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Categoría</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Precio Compra</label>
              <input type="number" min={0} value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: Number(e.target.value) })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Precio Venta</label>
              <input type="number" min={0} value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: Number(e.target.value) })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stock</label>
              <input type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {editingId ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      <CartPanel isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  )
}
