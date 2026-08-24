import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PaginationState } from './types'

const LIMIT_OPTIONS = [10, 25, 50]

function range(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i)
}

function pageList(current: number, total: number): (number | '…')[] {
  if (total <= 7) return range(1, total)
  if (current <= 4) return [...range(1, 5), '…', total]
  if (current >= total - 3) return [1, '…', ...range(total - 4, total)]
  return [1, '…', current - 1, current, current + 1, '…', total]
}

export default function Pagination({ page, limit, total, totalPages, onPageChange, onLimitChange }: PaginationState) {
  const from = total === 0 ? 0 : (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  const btnBase =
    'flex items-center justify-center min-w-9 h-9 px-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed'

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <span>
          {from}–{to} de {total}
        </span>
        <select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="border border-gray-200 rounded-xl px-2.5 py-1.5 bg-white text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
        >
          {LIMIT_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n} / pág.
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className={`${btnBase} text-gray-500 hover:bg-white hover:text-violet-600 shadow-sm`}
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {pageList(page, totalPages).map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-gray-400">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`${btnBase} ${
                p === page
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/25'
                  : 'text-gray-600 hover:bg-white hover:text-violet-600 shadow-sm'
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className={`${btnBase} text-gray-500 hover:bg-white hover:text-violet-600 shadow-sm`}
          aria-label="Página siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
