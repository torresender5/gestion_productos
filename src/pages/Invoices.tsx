import { useState, useEffect, useMemo, useRef } from 'react'
import { Eye, Printer, CheckCircle, Clock, Search, X, Download } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { useSaleStore } from '../stores/saleStore'
import { formatCurrency, formatDate } from '../lib/utils'
import Modal from '../components/Modal'
import type { Invoice, SaleItemWithProduct } from '../types'

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
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const invoiceRef = useRef<HTMLDivElement>(null)

  const [period, setPeriod] = useState<PeriodFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [searchText, setSearchText] = useState('')

  useEffect(() => {
    fetchInvoices()
  }, [])

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
      if (period !== 'all') {
        const invDate = new Date(inv.date)
        if (period === 'day' && invDate.toISOString().split('T')[0] !== todayStr) return false
        if (period === 'week' && invDate < startOfWeek) return false
        if (period === 'month' && (invDate.getMonth() !== currentMonth || invDate.getFullYear() !== currentYear)) return false
      }
      if (statusFilter !== 'all' && inv.status !== statusFilter) return false
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

  const handleDownloadPdf = async () => {
    if (!invoiceRef.current || generatingPdf) return
    
    setGeneratingPdf(true)
    try {
      const clone = invoiceRef.current.cloneNode(true) as HTMLElement
      clone.style.position = 'absolute'
      clone.style.left = '-9999px'
      clone.style.backgroundColor = '#ffffff'
      clone.style.color = '#111111'
      document.body.appendChild(clone)
      
      const allElements = clone.querySelectorAll('*')
      allElements.forEach((el) => {
        const htmlEl = el as HTMLElement
        const style = htmlEl.style
        style.color = '#111111'
        style.backgroundColor = '#ffffff'
        style.borderColor = '#e5e7eb'
        if (style.background && style.background.includes('oklch')) {
          style.background = '#f3f4f6'
        }
      })
      
      const canvas = await html2canvas(clone, {
        useCORS: true,
        logging: false,
        background: '#ffffff'
      })
      
      document.body.removeChild(clone)
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })
      
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      const imgX = (pdfWidth - imgWidth * ratio) / 2
      const imgY = 10
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
      pdf.save(`${selectedInvoice?.invoiceNumber || 'factura'}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      setGeneratingPdf(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 no-print">Facturas</h1>

      <div className="card p-4 mb-4 no-print space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por cliente o N° factura..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="input pl-10 text-sm"
            />
          </div>

          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as PeriodFilter)}
            className="input text-sm max-w-40"
          >
            <option value="all">Todos los períodos</option>
            <option value="day">Hoy</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="input text-sm max-w-40"
          >
            <option value="all">Todos los estados</option>
            <option value="PAID">Pagada</option>
            <option value="PENDING">Pendiente</option>
          </select>

          {hasActiveFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 px-3 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted transition-colors">
              <X className="w-3.5 h-3.5" /> Limpiar
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <p className="text-xs text-muted-foreground">{filtered.length} factura(s) encontrada(s)</p>
        )}
      </div>

      <div className="card overflow-hidden overflow-x-auto p-0 no-print">
        <table className="w-full text-sm min-w-[650px]">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="text-left p-4 font-medium text-muted-foreground">N° Factura</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Cliente</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Fecha</th>
              <th className="text-right p-4 font-medium text-muted-foreground">Total</th>
              <th className="text-center p-4 font-medium text-muted-foreground">Estado</th>
              <th className="text-right p-4 font-medium text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">{invoices.length === 0 ? 'No hay facturas generadas. Las facturas se crean automáticamente al registrar una venta.' : 'No se encontraron facturas con los filtros aplicados.'}</td></tr>
            ) : (
              [...filtered].reverse().map((inv) => (
                <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="p-4 font-mono font-medium text-accent">{inv.invoiceNumber}</td>
                  <td className="p-4">{(inv.client?.name || inv.clientName) || 'Cliente'}</td>
                  <td className="p-4 text-muted-foreground">{formatDate(new Date(inv.date))}</td>
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
                    <button onClick={() => setSelectedInvoice(inv)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={!!selectedInvoice} onClose={() => setSelectedInvoice(null)} title="" size="lg">
        {selectedInvoice && (
          <div>
            <div ref={invoiceRef} className="invoice-preview bg-white p-8 rounded-lg border border-border">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">FACTURA DE VENTA</h2>
                  <p className="text-lg font-mono text-accent mt-1">{selectedInvoice.invoiceNumber}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 uppercase mb-1">Fecha de emisión</div>
                  <p className="font-medium">{formatDate(new Date(selectedInvoice.date))}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8 p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Datos del Cliente</h3>
                  <p className="font-semibold text-gray-900">{selectedInvoice.client?.name || selectedInvoice.clientName || 'Cliente'}</p>
                  <p className="text-sm text-gray-600">NIT/CC: {selectedInvoice.client?.document || selectedInvoice.clientDocument || 'N/A'}</p>
                  <p className="text-sm text-gray-600">{selectedInvoice.client?.address || selectedInvoice.clientAddress || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Estado</h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    selectedInvoice.status === 'PAID'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {selectedInvoice.status === 'PAID' ? 'Pagada' : 'Pendiente'}
                  </span>
                </div>
              </div>

              <table className="w-full text-sm mb-6">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-3 font-semibold text-gray-700">Producto</th>
                    <th className="text-right p-3 font-semibold text-gray-700">Cantidad</th>
                    <th className="text-right p-3 font-semibold text-gray-700">Precio Unit.</th>
                    <th className="text-right p-3 font-semibold text-gray-700">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedInvoice.sale?.items || []).map((item: SaleItemWithProduct, i: number) => (
                    <tr key={i} className="border-b border-gray-200">
                      <td className="p-3 text-gray-800">{item.product?.name || 'Producto'}</td>
                      <td className="p-3 text-right text-gray-600">{item.quantity}</td>
                      <td className="p-3 text-right text-gray-600">{formatCurrency(item.unitPrice)}</td>
                      <td className="p-3 text-right text-gray-800 font-medium">{formatCurrency(item.subtotal ?? 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end">
                <div className="w-64">
                  <div className="flex justify-between py-2 text-gray-600">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between py-2 text-gray-600 border-t border-gray-200">
                    <span>IVA (19%):</span>
                    <span>{formatCurrency(selectedInvoice.tax)}</span>
                  </div>
                  <div className="flex justify-between py-3 text-xl font-bold border-t-2 border-gray-800">
                    <span>TOTAL:</span>
                    <span className="text-gray-900">{formatCurrency(selectedInvoice.total)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
                <p>Gracias por su preferencia</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-4 border-t border-border no-print">
              <button onClick={() => setSelectedInvoice(null)} className="btn btn-secondary">
                Cerrar
              </button>
              <button onClick={handleDownloadPdf} disabled={generatingPdf} className="btn btn-secondary">
                <Download className="w-4 h-4" />
                {generatingPdf ? 'Generando...' : 'Descargar PDF'}
              </button>
              <button onClick={handlePrint} className="btn btn-primary">
                <Printer className="w-4 h-4" /> Imprimir
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
