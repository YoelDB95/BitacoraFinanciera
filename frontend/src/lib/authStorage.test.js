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
  it('normalizes a login or register response', () => {
    expect(
      normalizeSession({
        token: 'jwt-1',
        tokenType: 'Bearer',
        expiresIn: 3600,
        user: {
          id: 'usr-1',
          email: 'yoel@example.com',
          name: 'Yoel',
        },
      }),
    ).toMatchObject({
      token: 'jwt-1',
      tokenType: 'Bearer',
      user: {
        id: 'usr-1',
        email: 'yoel@example.com',
        name: 'Yoel',
        username: 'yoel@example.com',
      },
    })
  })

  it('accepts nested responses and alternative field names', () => {
    expect(
      normalizeSession({
        data: {
          accessToken: 'jwt-2',
          usuario: { correo: 'yoel@example.com', nombre: 'Yoel' },
        },
      }),
    ).toMatchObject({
      token: 'jwt-2',
      user: { email: 'yoel@example.com', name: 'Yoel' },
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
