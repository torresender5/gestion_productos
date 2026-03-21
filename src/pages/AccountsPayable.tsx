import { useMemo, useEffect } from 'react'
import { CheckCircle } from 'lucide-react'
import { usePurchaseStore } from '../stores/purchaseStore'
import { formatCurrency, formatDate } from '../lib/utils'

export default function AccountsPayable() {
  const { purchases, fetchPurchases, updatePurchasePaymentStatus } = usePurchaseStore()

  useEffect(() => {
    fetchPurchases()
  }, [])

  const pendingPurchases = useMemo(
    () => purchases.filter((p) => (p.paymentStatus ?? 'paid') === 'pending'),
    [purchases]
  )

  const groupedBySupplier = useMemo(() => {
    const map: Record<string, { supplier: string; total: number; purchases: typeof pendingPurchases }> = {}
    for (const p of pendingPurchases) {
      if (!map[p.supplier]) {
        map[p.supplier] = { supplier: p.supplier, total: 0, purchases: [] }
      }
      map[p.supplier].total += p.total
      map[p.supplier].purchases.push(p)
    }
    return Object.values(map).sort((a, b) => b.total - a.total)
  }, [pendingPurchases])

  const totalDebt = pendingPurchases.reduce((sum, p) => sum + p.total, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Cuentas por Pagar</h1>
        <div className="text-right">
          <p className="text-sm text-gray-500">Total adeudado</p>
          <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalDebt)}</p>
        </div>
      </div>

      {groupedBySupplier.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center text-gray-500">
          No hay cuentas por pagar pendientes.
        </div>
      ) : (
        <div className="space-y-4">
          {groupedBySupplier.map(({ supplier, total, purchases: supplierPurchases }) => (
            <div key={supplier} className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="flex items-center justify-between p-4 bg-orange-50 border-b">
                <div>
                  <h2 className="font-semibold text-lg">{supplier}</h2>
                  <p className="text-sm text-gray-500">{supplierPurchases.length} compra(s) pendiente(s)</p>
                </div>
                <span className="text-lg font-bold text-orange-700">{formatCurrency(total)}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[500px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3 text-xs font-medium text-gray-600">Fecha</th>
                      <th className="text-right p-3 text-xs font-medium text-gray-600">Productos</th>
                      <th className="text-right p-3 text-xs font-medium text-gray-600">Total</th>
                      <th className="text-center p-3 text-xs font-medium text-gray-600">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supplierPurchases.map((p) => (
                      <tr key={p.id} className="border-t hover:bg-gray-50">
                        <td className="p-3">{formatDate(p.date)}</td>
                        <td className="p-3 text-right">{p.items.length}</td>
                        <td className="p-3 text-right font-medium">{formatCurrency(p.total)}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => updatePurchasePaymentStatus(p.id, 'paid')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Marcar pagado
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
