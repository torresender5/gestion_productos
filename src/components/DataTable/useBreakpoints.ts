import { useEffect, useState } from 'react'

const queries: Record<string, string> = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
}

export function useBreakpoints() {
  const [flags, setFlags] = useState(() => ({
    sm: window.matchMedia(queries.sm).matches,
    md: window.matchMedia(queries.md).matches,
    lg: window.matchMedia(queries.lg).matches,
    xl: window.matchMedia(queries.xl).matches,
  }))

  useEffect(() => {
    const mqls = Object.entries(queries).map(([key, q]) => {
      const mql = window.matchMedia(q)
      const handler = (e: MediaQueryListEvent) =>
        setFlags((prev) => ({ ...prev, [key]: e.matches }))
      mql.addEventListener('change', handler)
      return { mql, handler }
    })
    return () => {
      mqls.forEach(({ mql, handler }) => mql.removeEventListener('change', handler))
    }
  }, [])

  return flags
}
