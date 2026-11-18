import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from './AuthContext.js'
import { clearSession, readSession, saveSession } from '../lib/authStorage.js'
import { login as loginRequest, setUnauthorizedHandler } from '../lib/api.js'

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [session, setSession] = useState(readSession)

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setSession(null)
      navigate('/login', { replace: true })
    })

    return () => setUnauthorizedHandler(null)
  }, [navigate])

  const login = useCallback(async (credentials) => {
    const nextSession = await loginRequest(credentials)
    saveSession(nextSession)
    setSession(nextSession)
    return nextSession
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setSession(null)
    navigate('/login', { replace: true })
  }, [navigate])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      isAuthenticated: Boolean(session?.token),
      login,
      logout,
    }),
    [session, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
