import { afterEach, describe, expect, it } from 'vitest'
import {
  clearSession,
  normalizeSession,
  readSession,
  saveSession,
} from './authStorage.js'

const STORAGE_KEY = 'bitacora.auth.v1'

afterEach(() => {
  localStorage.clear()
})

describe('auth storage', () => {
  it('normalizes a login response', () => {
    expect(
      normalizeSession({
        token: 'jwt-1',
        tokenType: 'Bearer',
        expiresIn: 3600,
        user: { id: 'usr-1', username: 'yoel', name: 'Yoel' },
      }),
    ).toMatchObject({
      token: 'jwt-1',
      tokenType: 'Bearer',
      user: { id: 'usr-1', username: 'yoel', name: 'Yoel' },
    })
  })

  it('accepts nested responses and alternative field names', () => {
    expect(
      normalizeSession({
        data: {
          accessToken: 'jwt-2',
          usuario: { usuario: 'yoel', nombre: 'Yoel' },
        },
      }),
    ).toMatchObject({
      token: 'jwt-2',
      user: { username: 'yoel', name: 'Yoel' },
    })
  })

  it('returns null when the response has no token', () => {
    expect(normalizeSession({ user: { username: 'yoel' } })).toBeNull()
  })

  it('saves and reads a session', () => {
    const session = saveSession({
      token: 'jwt-3',
      user: { username: 'yoel' },
    })

    expect(readSession()).toEqual(session)
  })

  it('clears an expired session when reading it', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        token: 'jwt-expired',
        expiresAt: Date.now() - 1000,
        user: { username: 'yoel' },
      }),
    )

    expect(readSession()).toBeNull()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('clears corrupted stored data', () => {
    localStorage.setItem(STORAGE_KEY, '{invalid json')

    expect(readSession()).toBeNull()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('removes the stored session on clear', () => {
    saveSession({ token: 'jwt-4', user: { username: 'yoel' } })

    clearSession()

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})
