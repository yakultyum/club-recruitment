import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { User } from '../types'
import api from '../api'

interface AuthContextValue {
  user: User | null
  token: string | null
  ready: boolean
  switchDemo: (role: 'student' | 'club_admin') => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function demoLogin(role: 'student' | 'club_admin'): Promise<{ token: string; user: User }> {
  const res = await api.post('/auth/demo', { role })
  return res.data
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  const applyAuth = useCallback((t: string, u: User) => {
    localStorage.setItem('token', t)
    localStorage.setItem('user', JSON.stringify(u))
    // 立即更新 axios 默认 header，确保后续请求带上新 token
    api.defaults.headers.common['Authorization'] = `Bearer ${t}`
    setToken(t)
    setUser(u)
  }, [])

  const switchDemo = useCallback(async (role: 'student' | 'club_admin') => {
    try {
      const { token: t, user: u } = await demoLogin(role)
      applyAuth(t, u)
    } catch (e) {
      console.error('[AuthContext] demo login failed:', e)
      throw e
    }
  }, [applyAuth])

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')
    if (storedUser && storedToken) {
      const u = JSON.parse(storedUser) as User
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
      setToken(storedToken)
      setUser(u)
      setReady(true)
    } else {
      switchDemo('student')
        .catch(() => {})
        .finally(() => setReady(true))
    }
  }, [switchDemo])

  return (
    <AuthContext.Provider value={{ user, token, ready, switchDemo }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
