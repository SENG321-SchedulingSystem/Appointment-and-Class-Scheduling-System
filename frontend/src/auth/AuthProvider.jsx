import { useCallback, useState } from 'react'
import { ApiError, api } from '../api/client'
import { AuthContext } from './AuthContext'

const STORAGE_KEY = 'scheduling.session'

// sessionStorage keeps the user logged in on page refresh,
// and forgets the session when the browser tab is closed.
function loadSession() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadSession)
  const [sessionExpired, setSessionExpired] = useState(false)

  async function login(email, password) {
    const { token, userId, name, role } = await api.login(email, password)
    const session = { token, userId, name, role }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    setSessionExpired(false)
    setUser(session)
    return session
  }

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }, [])

  // Runs an API call with the current token. A 401 means the token expired
  // or is no longer valid: log out, and the protected route sends the user to Login.
  // Usage: await callApi((token) => api.createUser(token, body))
  const token = user?.token
  const callApi = useCallback(
    async (request) => {
      try {
        return await request(token)
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          setSessionExpired(true)
          logout()
        }
        throw err
      }
    },
    [token, logout],
  )

  return (
    <AuthContext.Provider value={{ user, login, logout, callApi, sessionExpired }}>{children}</AuthContext.Provider>
  )
}
