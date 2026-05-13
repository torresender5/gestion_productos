import { useState, useEffect } from 'react'
import { X, Trash2, Minus, Plus, ShoppingBag } from 'lucide-react'
import { useCartStore } from '../stores/cartStore'
import { useClientStore } from '../stores/clientStore'
import { useSaleStore } from '../stores/saleStore'
import { formatCurrency, TAX_RATE } from '../lib/utils'
import { useNavigate } from 'react-router-dom'

interface CartPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartPanel({ isOpen, onClose }: CartPanelProps) {
  const { items, removeItem, updateQuantity, clear } = useCartStore()
  const { clients, fetchClients } = useClientStore()
  const { addSale } = useSaleStore()
  const navigate = useNavigate()

  const [clientId, setClientId] = useState('')
  const [paymentStatus, setPaymentStatus] = useState<'PAID' | 'PENDING'>('PAID')

  useEffect(() => {
    fetchClients()
  }, [])

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  const tax = Math.round(subtotal * TAX_RATE)
  const total = subtotal + tax
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  const handleFinalize = async () => {
    if (items.length === 0 || !clientId) return

    const saleItems = items.map((i) => ({
      productId: i.productId,
      productName: i.productName,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      subtotal: i.unitPrice * i.quantity,
    }))

    try {
      const sale = await addSale({ clientId, items: saleItems, paymentStatus })
      clear()
      setClientId('')
      setPaymentStatus('PAID')
      onClose()
      navigate(`/invoices`)
    } catch {
      // error se maneja en el store
    }
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      )}

      {/* Panel */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-semibold">Carrito de Venta</h2>
            {itemCount > 0 && (
              <span className="bg-accent text-white text-xs font-bold px-2 py-0.5 rounded-full">{itemCount}</span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
            <ShoppingBag className="w-12 h-12 mb-3" />
            <p className="text-sm">El carrito está vacío</p>
            <p className="text-xs mt-1">Agrega productos desde el catálogo</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* Cart items */}
            <div className="p-4 space-y-3">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3 items-start bg-muted rounded-lg p-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.productName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatCurrency(item.unitPrice)} c/u</p>
                    <p className="text-sm font-semibold text-accent mt-1">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="p-1 rounded bg-surface border hover:bg-muted disabled:opacity-30 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.maxStock}
                      className="p-1 rounded bg-surface border hover:bg-muted disabled:opacity-30 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="p-1.5 text-destructive hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Client & payment selection */}
            <div className="p-4 border-t border-border space-y-3">
              <div>
                <label className="label block mb-1">Cliente *</label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="input text-sm"
                >
                  <option value="">Seleccionar cliente...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} - {c.document}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label block mb-1">Estado de Pago</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentStatus('PAID')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg border-2 transition-all duration-200 ${
                      paymentStatus === 'PAID'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-border text-muted-foreground hover:border-secondary'
                    }`}
                  >
                    Pagado
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentStatus('PENDING')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg border-2 transition-all duration-200 ${
                      paymentStatus === 'PENDING'
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-border text-muted-foreground hover:border-secondary'
                    }`}
                  >
                    Por Cobrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer totals & finalize */}
        {items.length > 0 && (
          <div className="border-t border-border p-4 space-y-3">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>IVA (19%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={clear}
                className="btn btn-secondary"
              >
                Vaciar
              </button>
              <button
                onClick={handleFinalize}
                disabled={!clientId}
                className="btn btn-primary flex-1"
              >
                Finalizar Venta
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
