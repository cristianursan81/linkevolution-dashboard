import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { api, clearSession } from '../api/client'

const AuthContext = createContext(null)

function readUser() {
  try {
    return JSON.parse(localStorage.getItem('le_user'))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('le_token'))
  const [user, setUser] = useState(readUser)

  const login = useCallback(async (email, password) => {
    const data = await api.login(email, password)
    const tok = data.access_token || data.token
    if (!tok) throw new Error('El servidor no devolvió un token')
    const usr = {
      id: data.user_id,
      email,
      role: data.role,
      tenant_id: data.tenant_id,
      ...(data.user || {}),
    }
    localStorage.setItem('le_token', tok)
    localStorage.setItem('le_user', JSON.stringify(usr))
    setToken(tok)
    setUser(usr)
    return data
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ token, user, login, logout, isAuthenticated: Boolean(token) }),
    [token, user, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
