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
    () => purchases.filter((p) => p.paymentStatus === 'PENDING'),
    [purchases]
  )

  const groupedBySupplier = useMemo(() => {
    const map: Record<string, { supplier: string; total: number; purchases: typeof pendingPurchases }> = {}
    for (const p of pendingPurchases) {
      const supplierName = p.supplier?.name || 'Proveedor'
      if (!map[supplierName]) {
        map[supplierName] = { supplier: supplierName, total: 0, purchases: [] }
      }
      map[supplierName].total += p.total
      map[supplierName].purchases.push(p)
    }
    return Object.values(map).sort((a, b) => b.total - a.total)
  }, [pendingPurchases])

  const totalDebt = pendingPurchases.reduce((sum, p) => sum + p.total, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold dark:text-white">Cuentas por Pagar</h1>
        <div className="text-right">
          <p className="text-sm text-muted-foreground dark:text-gray-400">Total adeudado</p>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{formatCurrency(totalDebt)}</p>
        </div>
      </div>

      {groupedBySupplier.length === 0 ? (
        <div className="card p-8 text-center text-muted-foreground">
          No hay cuentas por pagar pendientes.
        </div>
      ) : (
        <div className="space-y-4">
          {groupedBySupplier.map(({ supplier, total, purchases: supplierPurchases }) => (
            <div key={supplier} className="card overflow-hidden p-0">
              <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 border-b border-border">
                <div>
                  <h2 className="font-semibold text-lg dark:text-white">{supplier}</h2>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">{supplierPurchases.length} compra(s) pendiente(s)</p>
                </div>
                <span className="text-lg font-bold text-orange-700 dark:text-orange-400">{formatCurrency(total)}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[500px]">
                  <thead className="bg-muted dark:bg-gray-800">
                    <tr>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground dark:text-gray-400">Fecha</th>
                      <th className="text-right p-3 text-xs font-medium text-muted-foreground dark:text-gray-400">Productos</th>
                      <th className="text-right p-3 text-xs font-medium text-muted-foreground dark:text-gray-400">Total</th>
                      <th className="text-center p-3 text-xs font-medium text-muted-foreground dark:text-gray-400">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supplierPurchases.map((p) => (
                      <tr key={p.id} className="border-t border-border hover:bg-muted/50 dark:hover:bg-gray-800">
                        <td className="p-3 dark:text-gray-300">{formatDate(new Date(p.date))}</td>
                        <td className="p-3 text-right dark:text-gray-300">{p.items.length}</td>
                        <td className="p-3 text-right font-medium dark:text-gray-200">{formatCurrency(p.total)}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => updatePurchasePaymentStatus(p.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
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