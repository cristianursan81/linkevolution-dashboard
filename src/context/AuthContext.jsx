import { createContext, useContext, useState, useCallback } from 'react'
import { api } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('le_token'))
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('le_user'))
    } catch {
      return null
    }
  })

  const login = useCallback(async (email, password) => {
    console.log('[auth] login attempt for', email)
    const data = await api.login(email, password)
    console.log('[auth] login response data:', data)
    const tok = data.access_token || data.token
    console.log('[auth] token extracted:', tok ? tok.slice(0, 20) + '...' : 'NONE')
    const usr = data.user || { email }
    localStorage.setItem('le_token', tok)
    localStorage.setItem('le_user', JSON.stringify(usr))
    setToken(tok)
    setUser(usr)
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('le_token')
    localStorage.removeItem('le_user')
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
