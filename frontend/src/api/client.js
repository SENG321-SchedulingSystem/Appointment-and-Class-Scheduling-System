// Single entry point for calls to the backend (docs/API_Integration_Strategy.md).
// The base URL comes from VITE_API_BASE_URL, so switching between the Prism
// mock and the real backend needs no code changes.

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/+$/, '')

// Thrown for every non-2xx answer. Screens should branch on `status` and
// `code` (e.g. 409 / EMAIL_ALREADY_EXISTS), never on the `detail` text.
export class ApiError extends Error {
  constructor({ status, code, title, detail }) {
    super(detail || title || `Request failed with status ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.title = title
    this.detail = detail
  }
}

/**
 * apiRequest('/users', { method: 'POST', body: {...}, token })
 * Resolves with the parsed JSON body (or null for an empty body).
 */
export async function apiRequest(path, { method = 'GET', body, token, query } = {}) {
  const url = new URL(`${API_BASE_URL}${path}`)
  for (const [key, value] of Object.entries(query || {})) {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value)
  }

  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) })
  } catch {
    throw new ApiError({ status: 0, code: 'NETWORK_ERROR', detail: `Cannot reach the API at ${API_BASE_URL}.` })
  }

  const text = await res.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = null
    }
  }

  if (!res.ok) {
    throw new ApiError({ ...(data || {}), status: res.status })
  }
  return data
}

// Thin wrappers for the operations in openapi.yaml.
export const api = {
  login: (email, password) => apiRequest('/auth/login', { method: 'POST', body: { email, password } }),
  listUsers: (token, role) => apiRequest('/users', { token, query: { role } }),
  createUser: (token, user) => apiRequest('/users', { method: 'POST', token, body: user }),
  assignStudent: (token, studentId, instructorId) =>
    apiRequest('/assignments', { method: 'POST', token, body: { studentId, instructorId } }),
}
