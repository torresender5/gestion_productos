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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <span className="text-sm text-gray-500">{users.length} usuario{users.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Buscar por nombre o email..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-medium text-gray-600">Usuario</th>
              <th className="text-left p-4 font-medium text-gray-600">Email</th>
              <th className="text-center p-4 font-medium text-gray-600">Rol</th>
              <th className="text-left p-4 font-medium text-gray-600">Registrado</th>
              <th className="text-right p-4 font-medium text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">No se encontraron usuarios</td></tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-4">
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
                  <td className="p-4 text-gray-500">{u.email}</td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      u.role === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {u.role === 'admin' && <Shield className="w-3 h-3" />}
                      {u.role === 'admin' ? 'Admin' : 'Usuario'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500">{formatDate(u.createdAt)}</td>
                  <td className="p-4 text-right">
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
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre *</label>
              <input required type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Rol</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="admin">Administrador</option>
                <option value="user">Usuario</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nueva contraseña</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Dejar vacío para no cambiar"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Guardar Cambios</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
