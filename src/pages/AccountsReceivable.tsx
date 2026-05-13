import { useMemo, useEffect } from 'react'
import { CheckCircle } from 'lucide-react'
import { useSaleStore } from '../stores/saleStore'
import { formatCurrency, formatDate } from '../lib/utils'

export default function AccountsReceivable() {
  const { sales, fetchSales, updateSalePaymentStatus } = useSaleStore()

  useEffect(() => {
    fetchSales()
  }, [])

  const pendingSales = useMemo(
    () => sales.filter((s) => s.paymentStatus === 'PENDING'),
    [sales]
  )

  const groupedByClient = useMemo(() => {
    const map: Record<string, { clientName: string; total: number; sales: typeof pendingSales }> = {}
    for (const s of pendingSales) {
      const key = s.clientId
      if (!map[key]) {
        map[key] = { clientName: s.client?.name || 'Cliente', total: 0, sales: [] }
      }
      map[key].total += s.total
      map[key].sales.push(s)
    }
    return Object.values(map).sort((a, b) => b.total - a.total)
  }, [pendingSales])

  const totalReceivable = pendingSales.reduce((sum, s) => sum + s.total, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold dark:text-white">Cuentas por Cobrar</h1>
        <div className="text-right">
          <p className="text-sm text-muted-foreground dark:text-gray-400">Total por cobrar</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(totalReceivable)}</p>
        </div>
      </div>

      {groupedByClient.length === 0 ? (
        <div className="card p-8 text-center text-muted-foreground">
          No hay cuentas por cobrar pendientes.
        </div>
      ) : (
        <div className="space-y-4">
          {groupedByClient.map(({ clientName, total, sales: clientSales }) => (
            <div key={clientName} className="card overflow-hidden p-0">
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-border">
                <div>
                  <h2 className="font-semibold text-lg dark:text-white">{clientName}</h2>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">{clientSales.length} venta(s) pendiente(s)</p>
                </div>
                <span className="text-lg font-bold text-blue-700 dark:text-blue-400">{formatCurrency(total)}</span>
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
                    {clientSales.map((s) => (
                      <tr key={s.id} className="border-t border-border hover:bg-muted/50 dark:hover:bg-gray-800">
                        <td className="p-3 dark:text-gray-300">{formatDate(new Date(s.date))}</td>
                        <td className="p-3 text-right dark:text-gray-300">{s.items.length}</td>
                        <td className="p-3 text-right font-medium dark:text-gray-200">{formatCurrency(s.total)}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => updateSalePaymentStatus(s.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Marcar cobrado
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