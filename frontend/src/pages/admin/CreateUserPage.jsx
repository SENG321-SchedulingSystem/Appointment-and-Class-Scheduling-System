import { useState } from 'react'
import { ApiError, api } from '../../api/client'
import { useAuth } from '../../auth/AuthContext'
import { ErrorBox, Field, PrimaryButton, SelectField, SuccessBox } from '../../components/FormControls'

const EMPTY_FORM = { name: '', email: '', password: '', role: 'STUDENT' }
const PASSWORD_MIN_LENGTH = 8 // same rule as the backend (SRS FR-03)

// Screen 2a / 2c - Admin creates a user. POST /users (201, 400, 409).
export default function CreateUserPage() {
  const { callApi } = useAuth()

  const [form, setForm] = useState(EMPTY_FORM)
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const setField = (key) => (value) => setForm((f) => ({ ...f, [key]: value }))

  function validate() {
    const errors = {}
    if (!form.name.trim()) errors.name = 'Full name is required'
    if (!form.email.trim()) errors.email = 'Email is required'
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errors.email = 'Enter a valid email address'
    if (!form.password) errors.password = 'Password is required'
    else if (form.password.length < PASSWORD_MIN_LENGTH)
      errors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters`
    return errors
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
    setSuccess('')

    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setLoading(true)
    try {
      const created = await callApi((token) =>
        api.createUser(token, { ...form, name: form.name.trim(), email: form.email.trim() }),
      )
      setSuccess(`User created: ${created?.name || form.name.trim()} (${created?.role || form.role})`)
      setForm(EMPTY_FORM)
    } catch (err) {
      if (!(err instanceof ApiError)) setFormError('Something went wrong, please try again')
      else if (err.status === 409) setFieldErrors({ email: 'This email is already in use' })
      else if (err.status === 400) setFormError(err.detail || 'Please check the form fields')
      else if (err.status === 403) setFormError('You do not have permission to create users')
      else if (err.status === 0) setFormError('Cannot reach the server, please try again')
      else if (err.status !== 401) setFormError('Something went wrong, please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="max-w-2xl">
      <h1 className="text-3xl font-semibold text-[#0B1F38]">Create user</h1>
      <p className="mt-2 text-slate-500">Add a new user and set their access role.</p>

      <div className="mt-8 rounded-2xl border border-[#DCE4EF] bg-white p-8">
        {success && (
          <div className="mb-6">
            <SuccessBox>{success}</SuccessBox>
          </div>
        )}
        {formError && (
          <div className="mb-6">
            <ErrorBox>{formError}</ErrorBox>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <Field
            id="name"
            label="Full name"
            autoComplete="off"
            placeholder="Alex Morgan"
            value={form.name}
            onChange={setField('name')}
            error={fieldErrors.name}
          />
          <Field
            id="email"
            label="Email"
            type="email"
            autoComplete="off"
            placeholder="alex.morgan@example.com"
            value={form.email}
            onChange={setField('email')}
            error={fieldErrors.email}
          />
          <Field
            id="password"
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={form.password}
            onChange={setField('password')}
            error={fieldErrors.password}
          />
          <SelectField id="role" label="Role" value={form.role} onChange={setField('role')}>
            <option value="STUDENT">Student</option>
            <option value="INSTRUCTOR">Instructor</option>
          </SelectField>

          <PrimaryButton loading={loading} loadingText="Creating...">
            Create user
          </PrimaryButton>
        </form>
      </div>
    </section>
  )
}
