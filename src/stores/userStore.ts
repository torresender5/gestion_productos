import { create } from 'zustand'
import type { User } from '../types'
import { userService } from '../services/userService'

interface UserStore {
  users: User[]
  loading: boolean
  error: string | null
  fetchUsers: () => Promise<void>
  updateUser: (id: string, updates: { name?: string; email?: string; role?: 'ADMIN' | 'USER'; password?: string }) => Promise<{ ok: boolean; error?: string }>
  deleteUser: (id: string) => Promise<{ ok: boolean; error?: string }>
}

export const useUserStore = create<UserStore>()((set) => ({
  users: [],
  loading: false,
  error: null,

  fetchUsers: async () => {
    set({ loading: true, error: null })
    try {
      const response = await userService.getAll()
      set({ users: response.data, loading: false })
    } catch {
      set({ error: 'Error al cargar usuarios', loading: false })
    }
  },

  updateUser: async (id, updates) => {
    set({ loading: true, error: null })
    try {
      await userService.update(id, updates)
      const updated = await userService.getById(id)
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? updated : u)),
        loading: false,
      }))
      return { ok: true }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Error al actualizar usuario'
      set({ error: message, loading: false })
      return { ok: false, error: message }
    }
  },

  deleteUser: async (id) => {
    set({ loading: true, error: null })
    try {
      await userService.delete(id)
      set((state) => ({
        users: state.users.filter((u) => u.id !== id),
        loading: false,
      }))
      return { ok: true }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Error al eliminar usuario'
      set({ error: message, loading: false })
      return { ok: false, error: message }
    }
  },
}))
