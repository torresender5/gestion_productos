import { useState, useMemo, useEffect } from 'react'
import { Package, Users, ShoppingCart, TrendingUp, FileText, DollarSign, CreditCard, HandCoins } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { useProductStore } from '../stores/productStore'
import { useClientStore } from '../stores/clientStore'
import { usePurchaseStore } from '../stores/purchaseStore'
import { useSaleStore } from '../stores/saleStore'
import { formatCurrency } from '../lib/utils'
import type { Sale } from '../types'

type Period = 'day' | 'week' | 'month'

function getWeekLabel(date: Date): string {
  const startOfYear = new Date(date.getFullYear(), 0, 1)
  const diff = date.getTime() - startOfYear.getTime()
  const weekNum = Math.ceil((diff / 86400000 + startOfYear.getDay() + 1) / 7)
  return `Sem ${weekNum} - ${date.getFullYear()}`
}

function groupSalesByPeriod(sales: Sale[], period: Period) {
  const grouped: Record<string, { label: string; count: number; amount: number; sortKey: string }> = {}

  for (const sale of sales) {
    const date = new Date(sale.date)
    let key: string
    let label: string
    let sortKey: string

    switch (period) {
      case 'day':
        key = sale.date
        label = date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
        sortKey = sale.date
        break
      case 'week':
        key = getWeekLabel(date)
        label = key
        sortKey = `${date.getFullYear()}-${String(Math.ceil(((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / 86400000 + new Date(date.getFullYear(), 0, 1).getDay() + 1) / 7)).padStart(2, '0')}`
        break
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        label = date.toLocaleDateString('es-CO', { month: 'short', year: 'numeric' })
        sortKey = key
        break
    }

    if (!grouped[key]) {
      grouped[key] = { label, count: 0, amount: 0, sortKey }
    }
    grouped[key].count += 1
    grouped[key].amount += sale.total
  }

  return Object.values(grouped)
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .map(({ label, count, amount }) => ({ label, count, amount }))
}

const periodLabels: Record<Period, string> = {
  day: 'Día',
  week: 'Semana',
  month: 'Mes',
}

const currencyFormatter = (value: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, notation: 'compact' }).format(value)

export default function Dashboard() {
  const { products, fetchProducts } = useProductStore()
  const { clients, fetchClients } = useClientStore()
  const { purchases, fetchPurchases } = usePurchaseStore()
  const { sales, invoices, fetchSales, fetchInvoices } = useSaleStore()
  const [period, setPeriod] = useState<Period>('day')

  useEffect(() => {
    fetchProducts()
    fetchClients()
    fetchPurchases()
    fetchSales()
    fetchInvoices()
  }, [])

  const totalPurchases = purchases.reduce((sum, p) => sum + p.total, 0)
  const totalSales = sales.reduce((sum, s) => sum + s.total, 0)
  const pendingInvoices = invoices.filter((i) => i.status === 'pending').length
  const lowStock = products.filter((p) => p.stock < 10).length

  const chartData = useMemo(() => groupSalesByPeriod(sales, period), [sales, period])

  // Cuentas por pagar (compras pendientes agrupadas por proveedor)
  const accountsPayable = useMemo(() => {
    const pending = purchases.filter((p) => (p.paymentStatus ?? 'paid') === 'pending')
    const map: Record<string, { supplier: string; total: number }> = {}
    for (const p of pending) {
      if (!map[p.supplier]) map[p.supplier] = { supplier: p.supplier, total: 0 }
      map[p.supplier].total += p.total
    }
    return Object.values(map).sort((a, b) => b.total - a.total)
  }, [purchases])

  // Cuentas por cobrar (ventas pendientes agrupadas por cliente)
  const accountsReceivable = useMemo(() => {
    const pending = sales.filter((s) => (s.paymentStatus ?? 'paid') === 'pending')
    const map: Record<string, { clientName: string; total: number }> = {}
    for (const s of pending) {
      if (!map[s.clientId]) map[s.clientId] = { clientName: s.clientName, total: 0 }
      map[s.clientId].total += s.total
    }
    return Object.values(map).sort((a, b) => b.total - a.total)
  }, [sales])

  const totalPayable = accountsPayable.reduce((sum, a) => sum + a.total, 0)
  const totalReceivable = accountsReceivable.reduce((sum, a) => sum + a.total, 0)

  const cards = [
    { label: 'Productos', value: products.length, icon: Package, color: 'bg-blue-500' },
    { label: 'Clientes', value: clients.length, icon: Users, color: 'bg-green-500' },
    { label: 'Compras', value: formatCurrency(totalPurchases), icon: ShoppingCart, color: 'bg-orange-500' },
    { label: 'Ventas', value: formatCurrency(totalSales), icon: TrendingUp, color: 'bg-purple-500' },
    { label: 'Facturas Pendientes', value: pendingInvoices, icon: FileText, color: 'bg-red-500' },
    { label: 'Stock Bajo (<10)', value: lowStock, icon: DollarSign, color: 'bg-yellow-500' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl shadow-sm border p-6 flex items-center gap-4">
            <div className={`${color} p-3 rounded-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Period selector + Charts */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Gráficas de Ventas</h2>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {(['day', 'week', 'month'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  period === p
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>
        </div>

        {chartData.length === 0 ? (
          <p className="text-gray-500 text-center py-10">No hay datos de ventas para mostrar.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Número de ventas */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-3">Número de Ventas</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Ventas" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Monto de ventas */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-3">Monto de Ventas</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={currencyFormatter} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="amount" name="Monto" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Cuentas por Pagar y Cobrar */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cuentas por Pagar */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-semibold">Cuentas por Pagar</h2>
            </div>
            <Link to="/accounts-payable" className="text-sm text-blue-600 hover:text-blue-700">Ver todo</Link>
          </div>
          {accountsPayable.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay cuentas por pagar pendientes.</p>
          ) : (
            <>
              <div className="space-y-2 mb-3">
                {accountsPayable.slice(0, 5).map(({ supplier, total }) => (
                  <div key={supplier} className="flex justify-between items-center py-2 border-b last:border-0">
                    <span className="font-medium text-sm">{supplier}</span>
                    <span className="text-sm font-semibold text-orange-600">{formatCurrency(total)}</span>
                  </div>
                ))}
                {accountsPayable.length > 5 && (
                  <p className="text-xs text-gray-400">y {accountsPayable.length - 5} más...</p>
                )}
              </div>
              <div className="pt-3 border-t flex justify-between items-center">
                <span className="text-sm text-gray-500">Total adeudado</span>
                <span className="text-lg font-bold text-orange-600">{formatCurrency(totalPayable)}</span>
              </div>
            </>
          )}
        </div>

        {/* Cuentas por Cobrar */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HandCoins className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold">Cuentas por Cobrar</h2>
            </div>
            <Link to="/accounts-receivable" className="text-sm text-blue-600 hover:text-blue-700">Ver todo</Link>
          </div>
          {accountsReceivable.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay cuentas por cobrar pendientes.</p>
          ) : (
            <>
              <div className="space-y-2 mb-3">
                {accountsReceivable.slice(0, 5).map(({ clientName, total }) => (
                  <div key={clientName} className="flex justify-between items-center py-2 border-b last:border-0">
                    <span className="font-medium text-sm">{clientName}</span>
                    <span className="text-sm font-semibold text-blue-600">{formatCurrency(total)}</span>
                  </div>
                ))}
                {accountsReceivable.length > 5 && (
                  <p className="text-xs text-gray-400">y {accountsReceivable.length - 5} más...</p>
                )}
              </div>
              <div className="pt-3 border-t flex justify-between items-center">
                <span className="text-sm text-gray-500">Total por cobrar</span>
                <span className="text-lg font-bold text-blue-600">{formatCurrency(totalReceivable)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {products.length > 0 && (
        <div className="mt-8 bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Productos con Stock Bajo</h2>
          {lowStock === 0 ? (
            <p className="text-gray-500">Todos los productos tienen stock suficiente.</p>
          ) : (
            <div className="space-y-2">
              {products
                .filter((p) => p.stock < 10)
                .map((p) => (
                  <div key={p.id} className="flex justify-between items-center py-2 border-b last:border-0">
                    <span className="font-medium">{p.name}</span>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      p.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {p.stock} unidades
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
