import { useCallback, useEffect, useState } from 'react'
import { ApiError, api } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { ErrorBox, Field, PrimaryButton, SuccessBox } from '../components/FormControls'
import PageLayout from '../components/PageLayout'

function getTodayLocalDate() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatSlotDate(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatSlotTime(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function sortByStartTime(list) {
  return [...list].sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
}

// Screen 3 - Instructor availability management (FR-05, FR-06, FR-07).
export default function InstructorPage() {
  const { user, callApi } = useAuth()
  const instructorId = user?.userId

  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState('')
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchSlots = useCallback(async () => {
    if (!instructorId) return
    setLoading(true)
    setListError('')
    try {
      const data = await callApi((token) => api.listAvailability(token, { instructorId }))
      setSlots(sortByStartTime(Array.isArray(data) ? data : []))
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return
      if (err instanceof ApiError && err.status === 0) {
        setListError('Cannot reach the server, please try again')
      } else if (err instanceof ApiError && err.status === 403) {
        setListError('You do not have permission to view these availability slots')
      } else {
        setListError('Could not load availability slots, please refresh the page')
      }
    } finally {
      setLoading(false)
    }
  }, [callApi, instructorId])

  useEffect(() => {
    fetchSlots()
  }, [fetchSlots])

  async function handleAddSlot(e) {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')
    setActionError('')
    setActionSuccess('')

    const errors = {}
    if (!date) errors.date = 'Select a date'
    if (!startTime) errors.startTime = 'Select a start time'
    if (!endTime) errors.endTime = 'Select an end time'

    let startDate = null
    let endDate = null
    if (date && startTime && endTime) {
      startDate = new Date(`${date}T${startTime}`)
      endDate = new Date(`${date}T${endTime}`)

      if (Number.isNaN(startDate.getTime())) {
        errors.startTime = 'Enter a valid start time'
      } else if (startDate <= new Date()) {
        errors.startTime = 'Start time must be in the future'
      }

      if (Number.isNaN(endDate.getTime())) {
        errors.endTime = 'Enter a valid end time'
      } else if (!errors.startTime && endDate <= startDate) {
        errors.endTime = 'End time must be after start time'
      }
    }

    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSaving(true)
    try {
      const created = await callApi((token) =>
        api.addAvailability(token, startDate.toISOString(), endDate.toISOString()),
      )
      setSlots((prev) => sortByStartTime([...prev, created]))
      setFormSuccess('Availability slot added.')
      setStartTime('')
      setEndTime('')
      setFieldErrors({})
    } catch (err) {
      if (!(err instanceof ApiError)) {
        setFormError('Something went wrong, please try again')
      } else if (err.status === 400 || err.status === 409) {
        setFormError(err.detail || 'Invalid time range or overlaps with an existing slot')
      } else if (err.status === 403) {
        setFormError('You do not have permission to add availability slots')
      } else if (err.status === 0) {
        setFormError('Cannot reach the server, please try again')
      } else if (err.status !== 401) {
        setFormError('Something went wrong, please try again')
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteSlot(slot) {
    if (slot.status === 'BOOKED') return
    setActionError('')
    setActionSuccess('')
    setFormSuccess('')
    setDeletingId(slot.id)

    try {
      await callApi((token) => api.deleteAvailability(token, slot.id))
      setSlots((prev) => prev.filter((item) => item.id !== slot.id))
      setActionSuccess('Availability slot deleted.')
    } catch (err) {
      if (!(err instanceof ApiError)) {
        setActionError('Could not delete slot, please try again')
      } else if (err.status === 409) {
        setActionError('This slot has already been booked by a student and cannot be deleted.')
        fetchSlots()
      } else if (err.status === 404) {
        setActionError('This slot no longer exists.')
        setSlots((prev) => prev.filter((item) => item.id !== slot.id))
      } else if (err.status === 403) {
        setActionError('You do not have permission to delete this slot.')
      } else if (err.status === 0) {
        setActionError('Cannot reach the server, please try again')
      } else if (err.status !== 401) {
        setActionError('Could not delete slot, please try again')
      }
    } finally {
      setDeletingId(null)
    }
  }

  const availableCount = slots.filter((s) => s.status === 'AVAILABLE').length
  const bookedCount = slots.filter((s) => s.status === 'BOOKED').length

  return (
    <PageLayout title="My availability">
      <div className="max-w-4xl space-y-8">
        <p className="text-slate-500">
          Publish open teaching hours and manage your upcoming schedule. Only unbooked slots can be removed.
        </p>

        {/* Add availability slot card */}
        <section className="rounded-2xl border border-[#DCE4EF] bg-white p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-[#0B1F38]">Add availability slot</h2>
          <p className="mt-1 text-sm text-slate-500">Choose a future date and time interval.</p>

          <div className="mt-5 space-y-4">
            {formSuccess && <SuccessBox>{formSuccess}</SuccessBox>}
            {formError && <ErrorBox>{formError}</ErrorBox>}
          </div>

          <form onSubmit={handleAddSlot} noValidate className="mt-6 space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <Field
                id="slot-date"
                label="Date"
                type="date"
                min={getTodayLocalDate()}
                value={date}
                onChange={setDate}
                error={fieldErrors.date}
              />
              <Field
                id="slot-start"
                label="Start time"
                type="time"
                value={startTime}
                onChange={setStartTime}
                error={fieldErrors.startTime}
              />
              <Field
                id="slot-end"
                label="End time"
                type="time"
                value={endTime}
                onChange={setEndTime}
                error={fieldErrors.endTime}
              />
            </div>

            <PrimaryButton loading={saving} loadingText="Adding slot...">
              Add slot
            </PrimaryButton>
          </form>
        </section>

        {/* Instructor slots list card */}
        <section className="rounded-2xl border border-[#DCE4EF] bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[#0B1F38]">Your slots</h2>
              {!loading && !listError && (
                <p className="mt-1 text-sm text-slate-500">
                  {availableCount} available · {bookedCount} booked
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={fetchSlots}
              disabled={loading}
              className="rounded-lg border border-[#DCE4EF] bg-white px-4 py-2 text-sm font-medium text-[#0F2A4A] hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {actionSuccess && <SuccessBox>{actionSuccess}</SuccessBox>}
            {actionError && <ErrorBox>{actionError}</ErrorBox>}
            {listError && <ErrorBox>{listError}</ErrorBox>}
          </div>

          {loading && <p className="mt-6 text-sm text-slate-500">Loading your availability slots...</p>}

          {!loading && !listError && slots.length === 0 && (
            <p className="mt-6 rounded-lg bg-[#EDF1F7] px-4 py-3 text-sm text-slate-600">
              You have no availability slots yet. Add your first slot above so your assigned students can book a
              lesson.
            </p>
          )}

          {!loading && !listError && slots.length > 0 && (
            <ul className="mt-6 divide-y divide-[#DCE4EF] rounded-xl border border-[#DCE4EF]">
              {slots.map((slot) => {
                const isBooked = slot.status === 'BOOKED'
                const isDeleting = deletingId === slot.id

                return (
                  <li
                    key={slot.id}
                    className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#0B1F38]">{formatSlotDate(slot.startTime)}</p>
                      <p className="mt-0.5 text-sm text-slate-600">
                        {formatSlotTime(slot.startTime)} – {formatSlotTime(slot.endTime)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          isBooked
                            ? 'bg-[#EDF1F7] text-[#0F2A4A]'
                            : 'bg-[#ECFDF5] text-[#047857]'
                        }`}
                      >
                        {isBooked ? 'BOOKED' : 'AVAILABLE'}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleDeleteSlot(slot)}
                        disabled={isBooked || isDeleting}
                        title={isBooked ? 'Booked slots cannot be deleted' : 'Delete availability slot'}
                        className="rounded-lg border border-[#FCA5A5] px-3.5 py-2 text-xs font-medium text-[#B91C1C] hover:bg-[#FEF2F2] disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-transparent"
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </PageLayout>
  )
}