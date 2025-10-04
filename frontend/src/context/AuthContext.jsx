import { createContext, useEffect, useState } from 'react'
import { getMe, login as loginApi, signup as signupApi } from '../services/authService.js'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(!!token)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchMe() {
      try {
        const me = await getMe(token)
        setUser(me.user)
      } catch (_) {
        setToken(null)
        localStorage.removeItem('token')
      } finally {
        setLoading(false)
      }
    }
    if (token) fetchMe()
  }, [token])

  const login = async (email, password) => {
    setError(null)
    const { token: t, user } = await loginApi(email, password)
    setToken(t)
    setUser(user)
    localStorage.setItem('token', t)
  }

  const signup = async (payload) => {
    setError(null)
    const { token: t, user } = await signupApi(payload)
    setToken(t)
    setUser(user)
    localStorage.setItem('token', t)
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, error, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
