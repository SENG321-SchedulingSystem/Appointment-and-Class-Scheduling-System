import { useState } from 'react'
import { api } from '../api/client'
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

  async function login(email, password) {
    const { token, userId, name, role } = await api.login(email, password)
    const session = { token, userId, name, role }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    setUser(session)
    return session
  }

  function logout() {
    sessionStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}
