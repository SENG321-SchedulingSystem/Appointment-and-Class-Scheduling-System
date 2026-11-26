import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/client'
import { ROLE_HOME, useAuth } from '../auth/AuthContext'
import { ErrorBox, Field } from '../components/FormControls'
import { CalendarIcon } from '../components/Icons'

// Screen 1 - Login (Figma 1a, 1b, 1c). POST /auth/login through client.js.
export default function LoginPage() {
  const { user, login, sessionExpired } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  // Already logged in: go straight to the role's page.
  if (user) return <Navigate to={ROLE_HOME[user.role] || '/login'} replace />

  function validate() {
    const errors = {}
    if (!email.trim()) errors.email = 'Email is required'
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) errors.email = 'Enter a valid email address'
    if (!password) errors.password = 'Password is required'
    return errors
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')

    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setLoading(true)
    try {
      const session = await login(email.trim(), password)
      navigate(ROLE_HOME[session.role] || '/login', { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setFormError('Invalid email or password')
      } else if (err instanceof ApiError && err.status === 0) {
        setFormError('Cannot reach the server, please try again')
      } else if (err instanceof ApiError && err.status === 400) {
        setFormError('Please check your email and password')
      } else {
        setFormError('Something went wrong, please try again')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel (hidden on small screens) */}
      <aside className="hidden w-1/2 flex-col bg-[#0F2A4A] p-16 text-white lg:flex">
        <div className="flex items-center gap-3 text-xl font-medium">
          <CalendarIcon />
          Appointment Scheduling
        </div>
        <h2 className="mt-28 max-w-md text-5xl leading-tight font-semibold">
          Book private lessons without the back-and-forth
        </h2>
        <CalendarIllustration />
      </aside>

      {/* Right side: login card */}
      <main className="flex flex-1 items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md rounded-2xl border border-[#DCE4EF] bg-white p-10 shadow-sm">
          <p className="text-sm font-semibold text-[#0F2A4A]">Appointment Scheduling System</p>
          <h1 className="mt-6 text-3xl font-semibold text-[#0B1F38]">Sign in</h1>
          <p className="mt-1 text-sm text-slate-500">Welcome back. Sign in to continue.</p>

          {(formError || sessionExpired) && (
            <div className="mt-6">
              <ErrorBox>{formError || 'Your session has expired, please sign in again'}</ErrorBox>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
            <Field
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={setEmail}
              error={fieldErrors.email}
            />
            <Field
              id="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={setPassword}
              error={fieldErrors.password}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#0F2A4A] py-3 text-sm font-medium text-white hover:bg-[#0B1F38] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

// Decorative calendar card like in the Figma design.
function CalendarIllustration() {
  const dark = [9, 18]
  const mid = [4, 10, 17]
  return (
    <div className="mt-auto mb-8 ml-6 max-w-lg rounded-2xl bg-white p-6" aria-hidden="true">
      <div className="mb-5 flex items-center justify-between">
        <div className="h-3 w-28 rounded-full bg-[#C9D4E3]" />
        <div className="flex gap-2">
          <div className="h-3 w-5 rounded bg-[#EDF1F7]" />
          <div className="h-3 w-5 rounded bg-[#EDF1F7]" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-3">
        {Array.from({ length: 28 }, (_, i) => (
          <div
            key={i}
            className={`h-10 rounded-lg ${
              dark.includes(i) ? 'bg-[#0F2A4A]' : mid.includes(i) ? 'bg-[#DCE4EF]' : 'bg-[#EDF1F7]'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
