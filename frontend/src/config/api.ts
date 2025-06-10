// API設定
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Google Maps設定
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
}

// API呼び出しヘルパー関数
export const apiCall = async (endpoint: string, options?: RequestInit) => {
  const url = `${API_BASE_URL}${endpoint}`
  
  const response = await fetch(url, {
    headers: apiConfig.headers,
    ...options,
  })
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
  }
  
  return response.json()
}

export default apiConfig 