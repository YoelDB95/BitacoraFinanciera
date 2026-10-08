const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '')

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!response.ok) {
    let message = `Error ${response.status}`
    try {
      const error = await response.json()
      if (error?.error) message = error.error
    } catch {
      // ignore parse errors
    }
    throw new Error(message)
  }

  return response.json()
}

export function getCompanies() {
  return request('/api/companies')
}

export function createCompany(data) {
  return request('/api/companies', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}