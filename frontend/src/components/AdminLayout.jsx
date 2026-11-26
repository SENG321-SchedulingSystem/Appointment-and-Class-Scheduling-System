import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { CalendarIcon, LinkIcon, LogoutIcon, UserIcon, UsersIcon } from './Icons'

// Admin workspace layout (Figma 2a/2b): side menu with Users and Pairings, header with the admin name.
export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${
      isActive ? 'bg-[#EDF1F7] text-[#0B1F38]' : 'text-slate-600 hover:bg-slate-50'
    }`

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-64 shrink-0 flex-col border-r border-[#DCE4EF] bg-white px-4 py-6">
        <div className="flex items-center gap-3 px-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F2A4A] text-white">
            <CalendarIcon className="h-5 w-5" />
          </span>
          <span className="text-sm leading-tight font-semibold text-[#0B1F38]">Appointment Scheduling System</span>
        </div>
        <p className="mt-6 border-b border-[#DCE4EF] px-2 pb-4 text-xs text-slate-500">Admin workspace</p>

        <nav className="mt-4 space-y-1">
          <NavLink to="/admin/users" className={linkClass}>
            <UsersIcon /> Users
          </NavLink>
          <NavLink to="/admin/pairings" className={linkClass}>
            <LinkIcon /> Pairings
          </NavLink>
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-auto flex items-center gap-3 border-t border-[#DCE4EF] px-4 pt-4 text-sm text-slate-600 hover:text-[#0B1F38]"
        >
          <LogoutIcon /> Logout
        </button>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-[#DCE4EF] bg-white px-8 py-4">
          <span className="font-semibold text-[#0B1F38]">Administration</span>
          <div className="flex items-center gap-3 text-sm text-slate-700">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EDF1F7] text-[#0F2A4A]">
              <UserIcon />
            </span>
            {user?.name}
          </div>
        </header>
        <main className="flex-1 px-8 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
