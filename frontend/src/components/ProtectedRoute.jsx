import { Navigate } from 'react-router-dom'
import { ROLE_HOME, useAuth } from '../auth/AuthContext'

// Not logged in -> Login page.
// Logged in with another role -> that role's own start page.
export default function ProtectedRoute({ role, children }) {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to={ROLE_HOME[user.role] || '/login'} replace />

  return children
}
