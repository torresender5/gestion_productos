import { AxiosError } from 'axios'

export const handleApiError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message
    
    if (Array.isArray(message)) {
      return message.join(', ')
    }
    
    return message || error.message || 'Error desconocido'
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return 'Error desconocido'
}
