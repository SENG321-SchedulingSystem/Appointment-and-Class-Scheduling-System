import { useEffect, useState } from 'react'
import { ApiError, api } from '../../api/client'
import { useAuth } from '../../auth/AuthContext'
import { ErrorBox, PrimaryButton, SelectField, SuccessBox } from '../../components/FormControls'

// Screen 2b - Admin pairs a student with an instructor.
// GET /users?role=STUDENT and ?role=INSTRUCTOR fill the dropdowns, POST /assignments saves (201, 400, 404).
export default function AssignStudentPage() {
  const { callApi } = useAuth()

  const [students, setStudents] = useState([])
  const [instructors, setInstructors] = useState([])
  const [listsLoading, setListsLoading] = useState(true)
  const [listsError, setListsError] = useState('')

  const [studentId, setStudentId] = useState('')
  const [instructorId, setInstructorId] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function loadUsers() {
      try {
        const [studentList, instructorList] = await Promise.all([
          callApi((token) => api.listUsers(token, 'STUDENT')),
          callApi((token) => api.listUsers(token, 'INSTRUCTOR')),
        ])
        if (cancelled) return
        setStudents(studentList || [])
        setInstructors(instructorList || [])
      } catch (err) {
        if (cancelled || (err instanceof ApiError && err.status === 401)) return
        setListsError(
          err instanceof ApiError && err.status === 0
            ? 'Cannot reach the server, please try again'
            : 'Could not load users, please refresh the page',
        )
      } finally {
        if (!cancelled) setListsLoading(false)
      }
    }
    loadUsers()
    return () => {
      cancelled = true
    }
  }, [callApi])

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
    setSuccess('')

    const errors = {}
    if (!studentId) errors.student = 'Select a student'
    if (!instructorId) errors.instructor = 'Select an instructor'
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSaving(true)
    try {
      await callApi((token) => api.assignStudent(token, studentId, instructorId))
      const student = students.find((u) => u.id === studentId)
      const instructor = instructors.find((u) => u.id === instructorId)
      setSuccess(`${student?.name} is now assigned to ${instructor?.name}`)
      setStudentId('')
      setInstructorId('')
    } catch (err) {
      if (!(err instanceof ApiError)) setFormError('Something went wrong, please try again')
      else if (err.status === 404) setFormError('User not found')
      else if (err.status === 400 && err.code === 'ROLE_MISMATCH')
        setFormError('The selected users do not have the student and instructor roles')
      else if (err.status === 400) setFormError(err.detail || 'Please check the selected users')
      else if (err.status === 403) setFormError('You do not have permission to assign students')
      else if (err.status === 0) setFormError('Cannot reach the server, please try again')
      else if (err.status !== 401) setFormError('Something went wrong, please try again')
    } finally {
      setSaving(false)
    }
  }

  const noUsers = !listsLoading && !listsError && (students.length === 0 || instructors.length === 0)

  return (
    <section className="max-w-2xl">
      <h1 className="text-3xl font-semibold text-[#0B1F38]">Assign student</h1>
      <p className="mt-2 text-slate-500">Pair a student with an instructor.</p>

      <div className="mt-8 rounded-2xl border border-[#DCE4EF] bg-white p-8">
        {listsLoading && <p className="text-sm text-slate-500">Loading students and instructors...</p>}

        {listsError && <ErrorBox>{listsError}</ErrorBox>}

        {noUsers && (
          <p className="rounded-lg bg-[#EDF1F7] px-4 py-3 text-sm text-slate-600">
            {students.length === 0 ? 'There are no students yet.' : 'There are no instructors yet.'} Create one in
            the Users tab first.
          </p>
        )}

        {!listsLoading && !listsError && !noUsers && (
          <>
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
              <SelectField
                id="student"
                label="Student"
                value={studentId}
                onChange={setStudentId}
                error={fieldErrors.student}
              >
                <option value="">Select a student</option>
                {students.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </SelectField>

              <SelectField
                id="instructor"
                label="Instructor"
                value={instructorId}
                onChange={setInstructorId}
                error={fieldErrors.instructor}
              >
                <option value="">Select an instructor</option>
                {instructors.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </SelectField>

              <p className="text-xs text-slate-500">
                A student has one instructor. Assigning again replaces the current instructor.
              </p>

              <PrimaryButton loading={saving} loadingText="Assigning...">
                Assign
              </PrimaryButton>
            </form>
          </>
        )}
      </div>
    </section>
  )
}
