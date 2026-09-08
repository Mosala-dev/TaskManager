const API_URL =
    import.meta.env.VITE_API_URL ||
    'https://taskmanager-2-nipy.onrender.com'

async function request(path, options = {}) {
  const token = localStorage.getItem('taskmanager_token')

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  })

  if (response.status === 204) {
    return null
  }

  const text = await response.text()
  let data = null

  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      (typeof data === 'string' ? data : null) ||
      `Request failed with status ${response.status}`

    const error = new Error(message)
    error.status = response.status
    throw error
  }

  return data
}

export const api = {
  register: (payload) =>
    request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  login: (payload) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getTasks: () => request('/api/tasks'),

  createTask: (payload) =>
    request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  updateTask: (id, payload) =>
    request(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),

  deleteTask: (id) =>
    request(`/api/tasks/${id}`, {
      method: 'DELETE'
    })
}
