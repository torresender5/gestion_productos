import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import type { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: 'ADMIN' | 'USER'
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />
  }
  
  return <>{children}</>
}
