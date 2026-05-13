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
  Moon,
  Sun,
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useThemeStore } from '../stores/themeStore'

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
  const { theme, toggleTheme } = useThemeStore()

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
        className={`no-print fixed inset-y-0 left-0 z-50 w-64 bg-primary text-white flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 dark:bg-primary dark:text-white ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-secondary/30 flex items-center justify-between dark:border-white/10">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6 text-accent dark:text-accent-dark" />
            GestiónPro
          </h1>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-1.5 rounded-lg hover:bg-secondary transition-colors" title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}>
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <button onClick={onClose} className="lg:hidden p-1 rounded-lg hover:bg-secondary transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
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
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-accent text-white shadow-sm dark:bg-accent dark:text-gray-900'
                    : 'text-white/80 hover:bg-secondary hover:text-white dark:text-white/70 dark:hover:bg-secondary'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-secondary/30 space-y-3 dark:border-white/10">
          <div className="flex items-center gap-2 text-sm">
            <UserCircle className="w-5 h-5 text-white/60 shrink-0" />
            <div className="min-w-0">
              <span className="text-white truncate block">{user?.name}</span>
              <span className={`text-xs ${user?.role === 'ADMIN' ? 'text-accent' : 'text-white/50'}`}>
                {user?.role === 'ADMIN' ? 'Administrador' : 'Usuario'}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white/80 hover:bg-secondary hover:text-white rounded-lg transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}
