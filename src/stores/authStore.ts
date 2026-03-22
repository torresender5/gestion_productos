import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '../services/authService'
import type { User } from '../types'

interface AuthStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authService.login({ email, password })
          set({
            user: {
              id: response.id,
              email: response.email,
              name: response.name,
              role: response.role,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            token: response.accessToken,
            isAuthenticated: true,
            isLoading: false,
          })
          return { ok: true }
        } catch (err: any) {
          const message = err.response?.data?.message || 'Email o contraseña incorrectos'
          set({ error: message, isLoading: false })
          return { ok: false, error: message }
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authService.register({ name, email, password })
          set({
            user: {
              id: response.id,
              email: response.email,
              name: response.name,
              role: response.role,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            token: response.accessToken,
            isAuthenticated: true,
            isLoading: false,
          })
          return { ok: true }
        } catch (err: any) {
          const message = err.response?.data?.message || 'Error al registrar usuario'
          set({ error: message, isLoading: false })
          return { ok: false, error: message }
        }
      },

      logout: () => {
        authService.logout()
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
)

export type Role = 'ADMIN' | 'USER'
export type { User }
