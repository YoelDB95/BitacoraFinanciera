const STORAGE_KEY = 'bitacora.auth.v1'

function normalizeUser(user) {
  if (!user || typeof user !== 'object') return null

  const username = String(user.username ?? user.usuario ?? '').trim()
  const name = String(user.name ?? user.nombre ?? username).trim()

  return {
    id: user.id ?? user.userId ?? '',
    username,
    name: name || username,
    email: String(user.email ?? '').trim(),
  }
}

function readExpiration(payload = {}) {
  if (payload.expiresAt != null) {
    const value = Number(payload.expiresAt)
    return Number.isFinite(value) ? value : null
  }

  const seconds = Number(payload.expiresIn ?? payload.expires_in)
  if (!Number.isFinite(seconds) || seconds <= 0) return null

  return Date.now() + seconds * 1000
}

export function normalizeSession(data = {}) {
  const payload = data?.data ?? data ?? {}
  const token = String(
    payload.token ?? payload.accessToken ?? payload.access_token ?? '',
  ).trim()

  if (!token) return null

  return {
    token,
    tokenType: String(payload.tokenType ?? payload.token_type ?? 'Bearer'),
    expiresAt: readExpiration(payload),
    user: normalizeUser(payload.user ?? payload.usuario),
  }
}

export function readSession() {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const session = normalizeSession(JSON.parse(raw))
    if (!session) {
      clearSession()
      return null
    }

    if (
      session.expiresAt != null &&
      Number.isFinite(session.expiresAt) &&
      session.expiresAt <= Date.now()
    ) {
      clearSession()
      return null
    }

    return session
  } catch {
    clearSession()
    return null
  }
}

export function saveSession(data) {
  const session = normalizeSession(data)
  if (!session) return null

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } catch {
      // Storage unavailable — keep the session in memory only.
    }
  }

  return session
}

export function clearSession() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Storage unavailable — nothing to clear.
  }
}
