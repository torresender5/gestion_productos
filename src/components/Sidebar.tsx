import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Users,
  Truck,
  ShoppingCart,
  TrendingUp,
  FileText,
  CreditCard,
  HandCoins,
  X,
  LogOut,
  UserCircle,
  Shield,
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'Productos', icon: Package },
  { to: '/clients', label: 'Clientes', icon: Users },
  { to: '/suppliers', label: 'Proveedores', icon: Truck },
  { to: '/purchases', label: 'Compras', icon: ShoppingCart },
  { to: '/sales', label: 'Ventas', icon: TrendingUp },
  { to: '/invoices', label: 'Facturas', icon: FileText },
  { to: '/accounts-payable', label: 'Cuentas por Pagar', icon: CreditCard },
  { to: '/accounts-receivable', label: 'Cuentas por Cobrar', icon: HandCoins },
  { to: '/users', label: 'Usuarios', icon: Shield, adminOnly: true },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`no-print fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-400" />
            GestiónPro
          </h1>
          <button onClick={onClose} className="lg:hidden p-1 rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links
            .filter((link) => !('adminOnly' in link && link.adminOnly) || user?.role === 'ADMIN')
            .map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <UserCircle className="w-5 h-5 text-slate-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-slate-300 truncate block">{user?.name}</span>
              <span className={`text-xs ${user?.role === 'ADMIN' ? 'text-purple-400' : 'text-slate-500'}`}>
                {user?.role === 'ADMIN' ? 'Administrador' : 'Usuario'}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}
