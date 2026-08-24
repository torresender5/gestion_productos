import { useState, useEffect } from 'react'
import { Search, Edit, Trash2, Shield, UserCircle, Loader2 } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import type { Role } from '../stores/authStore'
import { formatDate } from '../lib/utils'
import Modal from '../components/Modal'

export default function UserManagement() {
  const currentUser = useAuthStore((s) => s.user)
  const users = useAuthStore((s) => s.users)
  const loading = useAuthStore((s) => s.loading)
  const fetchUsers = useAuthStore((s) => s.fetchUsers)
  const updateUser = useAuthStore((s) => s.updateUser)
  const deleteUser = useAuthStore((s) => s.deleteUser)

  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', email: '', role: 'user' as Role, password: '' })
  const [error, setError] = useState('')

  const isAdmin = currentUser?.role === 'admin'

  useEffect(() => {
    if (isAdmin) fetchUsers()
  }, [isAdmin])

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const openEdit = (user: typeof users[0]) => {
    setForm({ name: user.name, email: user.email, role: user.role, password: '' })
    setEditingId(user.id)
    setError('')
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingId) return
    setError('')

    const updates: { name?: string; email?: string; role?: Role; password?: string } = {
      name: form.name,
      email: form.email,
      role: form.role,
    }
    if (form.password) {
      if (form.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres')
        return
      }
      updates.password = form.password
    }

    const result = await updateUser(editingId, updates)
    if (result.ok) {
      setIsModalOpen(false)
    } else {
      setError(result.error || 'Error al actualizar')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar al usuario "${name}"?`)) return
    const result = await deleteUser(id)
    if (!result.ok) {
      alert(result.error)
    }
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Shield className="w-16 h-16 mb-4 text-gray-300" />
        <h2 className="text-xl font-semibold mb-2">Acceso restringido</h2>
        <p>Solo los administradores pueden gestionar usuarios.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
            <p className="text-sm text-gray-500 mt-1">Administra las cuentas y permisos del sistema</p>
          </div>
          <span className="text-sm text-gray-500">{users.length} usuario{users.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Buscar por nombre o email..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border-0 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm transition-all" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-gray-50/80">
            <tr>
              <th className="text-left px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Usuario</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Email</th>
              <th className="text-center px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Rol</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Registrado</th>
              <th className="text-right px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No se encontraron usuarios</td></tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <UserCircle className="w-8 h-8 text-gray-300 shrink-0" />
                      <div>
                        <p className="font-medium">{u.name}</p>
                        {u.id === currentUser?.id && (
                          <span className="text-xs text-blue-600">(Tú)</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{u.email}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      u.role === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {u.role === 'admin' && <Shield className="w-3 h-3" />}
                      {u.role === 'admin' ? 'Admin' : 'Usuario'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(u.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" title="Editar">
                        <Edit className="w-4 h-4" />
                      </button>
                      {u.id !== currentUser?.id && (
                        <button onClick={() => handleDelete(u.id, u.name)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Eliminar">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Editar Usuario">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl p-3">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre *</label>
              <input required type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm transition-all" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Rol</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm transition-all">
                <option value="admin">Administrador</option>
                <option value="user">Usuario</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nueva contraseña</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Dejar vacío para no cambiar"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm transition-all" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg shadow-violet-500/25 text-sm font-medium">Guardar Cambios</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
