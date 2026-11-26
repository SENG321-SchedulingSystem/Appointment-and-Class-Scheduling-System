import { createContext, useContext } from 'react'

// Holds the logged-in user: { token, userId, name, role } or null.
export const AuthContext = createContext(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

// Start page for each role after login.
export const ROLE_HOME = {
  ADMIN: '/admin',
  INSTRUCTOR: '/instructor',
  STUDENT: '/student',
}
