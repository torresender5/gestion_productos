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

const kpiConfig = [
  { key: 'products', label: 'Productos', icon: Package, gradient: 'from-blue-500 to-blue-600', bgLight: 'bg-blue-50', text: 'text-blue-600' },
  { key: 'clients', label: 'Clientes', icon: Users, gradient: 'from-emerald-500 to-emerald-600', bgLight: 'bg-emerald-50', text: 'text-emerald-600' },
  { key: 'purchases', label: 'Compras', icon: ShoppingCart, gradient: 'from-orange-500 to-orange-600', bgLight: 'bg-orange-50', text: 'text-orange-600' },
  { key: 'sales', label: 'Ventas', icon: TrendingUp, gradient: 'from-violet-500 to-violet-600', bgLight: 'bg-violet-50', text: 'text-violet-600' },
  { key: 'invoices', label: 'Facturas Pendientes', icon: FileText, gradient: 'from-rose-500 to-rose-600', bgLight: 'bg-rose-50', text: 'text-rose-600' },
  { key: 'lowStock', label: 'Stock Bajo', icon: DollarSign, gradient: 'from-amber-500 to-amber-600', bgLight: 'bg-amber-50', text: 'text-amber-600' },
] as const

export default function Dashboard() {
  const { products, fetchAllProducts } = useProductStore()
  const { clients, fetchClients } = useClientStore()
  const { purchases, fetchPurchases } = usePurchaseStore()
  const { sales, invoices, fetchSales, fetchInvoices } = useSaleStore()
  const [period, setPeriod] = useState<Period>('day')

  useEffect(() => {
    fetchAllProducts()
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

  const accountsPayable = useMemo(() => {
    const pending = purchases.filter((p) => (p.paymentStatus ?? 'paid') === 'pending')
    const map: Record<string, { supplier: string; total: number }> = {}
    for (const p of pending) {
      if (!map[p.supplier]) map[p.supplier] = { supplier: p.supplier, total: 0 }
      map[p.supplier].total += p.total
    }
    return Object.values(map).sort((a, b) => b.total - a.total)
  }, [purchases])

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

  const kpiValues: Record<string, string | number> = {
    products: products.length,
    clients: clients.length,
    purchases: formatCurrency(totalPurchases),
    sales: formatCurrency(totalSales),
    invoices: pendingInvoices,
    lowStock,
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Resumen general de tu negocio</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {kpiConfig.map(({ key, label, icon: Icon, gradient, bgLight, text }) => (
          <div
            key={key}
            className="group relative bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br opacity-[0.03] group-hover:opacity-[0.06] transition-opacity ${gradient}" />
            <div className="relative flex items-center gap-4">
              <div className={`bg-gradient-to-br ${gradient} p-3 rounded-xl shadow-lg shadow-gray-200/50`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{kpiValues[key]}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Gráficas de Ventas</h2>
            <p className="text-sm text-gray-500 mt-0.5">Análisis de ventas por período</p>
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {(['day', 'week', 'month'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  period === p
                    ? 'bg-white text-violet-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <TrendingUp className="w-12 h-12 mb-3 opacity-40" />
            <p className="text-sm">No hay datos de ventas para mostrar</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-4">Número de Ventas</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  />
                  <Legend />
                  <Bar dataKey="count" name="Ventas" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-4">Monto de Ventas</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={currencyFormatter} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Legend />
                  <Bar dataKey="amount" name="Monto" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Cuentas por Pagar y Cobrar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Cuentas por Pagar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="bg-orange-50 p-2.5 rounded-xl">
                <CreditCard className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">Cuentas por Pagar</h2>
                <p className="text-xs text-gray-400">{accountsPayable.length} proveedores pendientes</p>
              </div>
            </div>
            <Link
              to="/accounts-payable"
              className="text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors"
            >
              Ver todo
            </Link>
          </div>
          {accountsPayable.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <CreditCard className="w-10 h-10 mb-2 opacity-40" />
              <p className="text-sm">No hay cuentas pendientes</p>
            </div>
          ) : (
            <>
              <div className="space-y-1">
                {accountsPayable.slice(0, 5).map(({ supplier, total }) => (
                  <div key={supplier} className="flex justify-between items-center py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <span className="text-sm font-medium text-gray-700">{supplier}</span>
                    <span className="text-sm font-semibold text-orange-600">{formatCurrency(total)}</span>
                  </div>
                ))}
                {accountsPayable.length > 5 && (
                  <p className="text-xs text-gray-400 px-3 pt-1">y {accountsPayable.length - 5} más...</p>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm text-gray-500">Total adeudado</span>
                <span className="text-lg font-bold text-orange-600">{formatCurrency(totalPayable)}</span>
              </div>
            </>
          )}
        </div>

        {/* Cuentas por Cobrar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2.5 rounded-xl">
                <HandCoins className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">Cuentas por Cobrar</h2>
                <p className="text-xs text-gray-400">{accountsReceivable.length} clientes pendientes</p>
              </div>
            </div>
            <Link
              to="/accounts-receivable"
              className="text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors"
            >
              Ver todo
            </Link>
          </div>
          {accountsReceivable.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <HandCoins className="w-10 h-10 mb-2 opacity-40" />
              <p className="text-sm">No hay cuentas pendientes</p>
            </div>
          ) : (
            <>
              <div className="space-y-1">
                {accountsReceivable.slice(0, 5).map(({ clientName, total }) => (
                  <div key={clientName} className="flex justify-between items-center py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <span className="text-sm font-medium text-gray-700">{clientName}</span>
                    <span className="text-sm font-semibold text-blue-600">{formatCurrency(total)}</span>
                  </div>
                ))}
                {accountsReceivable.length > 5 && (
                  <p className="text-xs text-gray-400 px-3 pt-1">y {accountsReceivable.length - 5} más...</p>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm text-gray-500">Total por cobrar</span>
                <span className="text-lg font-bold text-blue-600">{formatCurrency(totalReceivable)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stock Bajo */}
      {products.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-amber-50 p-2.5 rounded-xl">
              <Package className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Productos con Stock Bajo</h2>
              <p className="text-xs text-gray-400">{lowStock} productos necesitan reposición</p>
            </div>
          </div>
          {lowStock === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <Package className="w-10 h-10 mb-2 opacity-40" />
              <p className="text-sm">Todos los productos tienen stock suficiente</p>
            </div>
          ) : (
            <div className="space-y-1">
              {products
                .filter((p) => p.stock < 10)
                .map((p) => (
                  <div key={p.id} className="flex justify-between items-center py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <span className="text-sm font-medium text-gray-700">{p.name}</span>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      p.stock === 0
                        ? 'bg-red-50 text-red-600'
                        : 'bg-amber-50 text-amber-600'
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
