import { create } from 'zustand'
import type { Client, CreateClientDto } from '../types'
import { clientService } from '../services/clientService'

interface ClientStore {
  clients: Client[]
  loading: boolean
  error: string | null
  fetchClients: () => Promise<void>
  addClient: (client: CreateClientDto) => Promise<void>
  updateClient: (id: string, client: Partial<Client>) => Promise<void>
  deleteClient: (id: string) => Promise<void>
}

export const useClientStore = create<ClientStore>()((set) => ({
  clients: [],
  loading: false,
  error: null,

  fetchClients: async () => {
    set({ loading: true, error: null })
    try {
      const response = await clientService.getAll()
      set({ clients: response.data, loading: false })
    } catch {
      set({ error: 'Error al cargar clientes', loading: false })
    }
  },

  addClient: async (client) => {
    set({ loading: true, error: null })
    try {
      const newClient = await clientService.create(client)
      set((state) => ({ clients: [...state.clients, newClient], loading: false }))
    } catch {
      set({ error: 'Error al crear cliente', loading: false })
      throw new Error('Error al crear cliente')
    }
  },

  updateClient: async (id, updates) => {
    set({ loading: true, error: null })
    try {
      const updated = await clientService.update(id, updates)
      set((state) => ({
        clients: state.clients.map((c) => (c.id === id ? updated : c)),
        loading: false,
      }))
    } catch {
      set({ error: 'Error al actualizar cliente', loading: false })
      throw new Error('Error al actualizar cliente')
    }
  },

  deleteClient: async (id) => {
    set({ loading: true, error: null })
    try {
      await clientService.delete(id)
      set((state) => ({
        clients: state.clients.filter((c) => c.id !== id),
        loading: false,
      }))
    } catch {
      set({ error: 'Error al eliminar cliente', loading: false })
      throw new Error('Error al eliminar cliente')
    }
  },
}))
