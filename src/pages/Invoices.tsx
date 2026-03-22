import { useState, useEffect, useMemo } from 'react'
import { Eye, Printer, CheckCircle, Clock, Search, X } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { useSaleStore } from '../stores/saleStore'
import { formatCurrency, formatDate } from '../lib/utils'
import Modal from '../components/Modal'
import type { Invoice } from '../types'

type PeriodFilter = 'all' | 'day' | 'week' | 'month'
type StatusFilter = 'all' | 'PAID' | 'PENDING'

function getStartOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  d.setHours(0, 0, 0, 0)
  return d
}

export default function Invoices() {
  const { invoices, loading, fetchInvoices, updateInvoiceStatus } = useSaleStore()
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()

  // Filters
  const [period, setPeriod] = useState<PeriodFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [searchText, setSearchText] = useState('')

  useEffect(() => {
    fetchInvoices()
  }, [])

  // Auto-open invoice when navigating from Sales with ?saleId=
  useEffect(() => {
    const saleId = searchParams.get('saleId')
    if (saleId) {
      const invoice = invoices.find((inv) => inv.saleId === saleId)
      if (invoice) setSelectedInvoice(invoice)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, invoices, setSearchParams])

  const filtered = useMemo(() => {
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]
    const startOfWeek = getStartOfWeek(now)
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    return invoices.filter((inv) => {
      // Period filter
      if (period !== 'all') {
        const invDate = new Date(inv.date)
        if (period === 'day' && invDate.toISOString().split('T')[0] !== todayStr) return false
        if (period === 'week' && invDate < startOfWeek) return false
        if (period === 'month' && (invDate.getMonth() !== currentMonth || invDate.getFullYear() !== currentYear)) return false
      }
      // Status filter
      if (statusFilter !== 'all' && inv.status !== statusFilter) return false
      // Text search (client name or invoice number)
      if (searchText) {
        const q = searchText.toLowerCase()
        const clientName = inv.client?.name || inv.clientName || ''
        if (!clientName.toLowerCase().includes(q) && !inv.invoiceNumber.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [invoices, period, statusFilter, searchText])

  const hasActiveFilters = period !== 'all' || statusFilter !== 'all' || searchText !== ''

  const clearFilters = () => {
    setPeriod('all')
    setStatusFilter('all')
    setSearchText('')
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 no-print">Facturas</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-4 no-print space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por cliente o N° factura..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Period */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as PeriodFilter)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los períodos</option>
            <option value="day">Hoy</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los estados</option>
            <option value="PAID">Pagada</option>
            <option value="PENDING">Pendiente</option>
          </select>

          {hasActiveFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 border rounded-lg hover:bg-gray-50">
              <X className="w-3.5 h-3.5" /> Limpiar
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <p className="text-xs text-gray-500">{filtered.length} factura(s) encontrada(s)</p>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden overflow-x-auto no-print">
        <table className="w-full text-sm min-w-[650px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-medium text-gray-600">N° Factura</th>
              <th className="text-left p-4 font-medium text-gray-600">Cliente</th>
              <th className="text-left p-4 font-medium text-gray-600">Fecha</th>
              <th className="text-right p-4 font-medium text-gray-600">Total</th>
              <th className="text-center p-4 font-medium text-gray-600">Estado</th>
              <th className="text-right p-4 font-medium text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">{invoices.length === 0 ? 'No hay facturas generadas. Las facturas se crean automáticamente al registrar una venta.' : 'No se encontraron facturas con los filtros aplicados.'}</td></tr>
            ) : (
              [...filtered].reverse().map((inv) => (
                <tr key={inv.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-4 font-mono font-medium text-blue-600">{inv.invoiceNumber}</td>
                  <td className="p-4">{(inv.client?.name || inv.clientName) || 'Cliente'}</td>
                  <td className="p-4 text-gray-500">{formatDate(new Date(inv.date))}</td>
                  <td className="p-4 text-right font-medium">{formatCurrency(inv.total)}</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => updateInvoiceStatus(inv.id, inv.status === 'PAID' ? 'PENDING' : 'PAID')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        inv.status === 'PAID'
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      }`}
                    >
                      {inv.status === 'PAID' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {inv.status === 'PAID' ? 'Pagada' : 'Pendiente'}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => setSelectedInvoice(inv)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal vista detalle de factura */}
      <Modal isOpen={!!selectedInvoice} onClose={() => setSelectedInvoice(null)} title="" size="lg">
        {selectedInvoice && (
          <div id="invoice-print">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">FACTURA DE VENTA</h2>
              <p className="text-lg font-mono text-blue-600 mt-1">{selectedInvoice.invoiceNumber}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Datos del Cliente</h3>
                <p className="font-medium">{selectedInvoice.client?.name || selectedInvoice.clientName || 'Cliente'}</p>
                <p className="text-sm text-gray-600">NIT/CC: {selectedInvoice.client?.document || selectedInvoice.clientDocument}</p>
                <p className="text-sm text-gray-600">{selectedInvoice.client?.address || selectedInvoice.clientAddress}</p>
              </div>
              <div className="sm:text-right">
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Detalles</h3>
                <p className="text-sm">Fecha: {formatDate(new Date(selectedInvoice.date))}</p>
                <p className="text-sm mt-1">
                  Estado:{' '}
                  <span className={`font-medium ${selectedInvoice.status === 'PAID' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {selectedInvoice.status === 'PAID' ? 'Pagada' : 'Pendiente'}
                  </span>
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
            <table className="w-full text-sm mb-6 min-w-[400px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 font-medium text-gray-600">Producto</th>
                  <th className="text-right p-3 font-medium text-gray-600">Cantidad</th>
                  <th className="text-right p-3 font-medium text-gray-600">Precio Unit.</th>
                  <th className="text-right p-3 font-medium text-gray-600">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {selectedInvoice.items.map((item, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-3">{item.productName}</td>
                    <td className="p-3 text-right">{item.quantity}</td>
                    <td className="p-3 text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="p-3 text-right">{formatCurrency(item.subtotal ?? 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>

            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span>{formatCurrency(selectedInvoice.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">IVA (19%):</span>
                <span>{formatCurrency(selectedInvoice.tax)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold border-t pt-2">
                <span>TOTAL:</span>
                <span>{formatCurrency(selectedInvoice.total)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-4 border-t no-print">
              <button onClick={() => setSelectedInvoice(null)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                Cerrar
              </button>
              <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Printer className="w-4 h-4" /> Imprimir
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
