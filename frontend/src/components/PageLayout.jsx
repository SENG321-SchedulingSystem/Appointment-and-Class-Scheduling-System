import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

// Shared header for the pages after login: app name, user name, role, Logout.
export default function PageLayout({ title, children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-[#0F2A4A] text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="font-semibold">Appointment Scheduling</span>
          <div className="flex items-center gap-4 text-sm">
            <span>{user?.name}</span>
            <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium">{user?.role}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-white/30 px-3 py-1.5 hover:bg-white/10"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="text-2xl font-semibold text-[#0B1F38]">{title}</h1>
        <div className="mt-6">{children}</div>
      </main>
    </div>
  )
}
