import { describe, it, expect, beforeEach } from 'vitest'
import { loadTransactions, saveTransactions, STORAGE_KEY } from './storage.js'

beforeEach(() => {
  localStorage.clear()
})

describe('storage', () => {
  it('returns seed transactions when storage is empty', () => {
    const tx = loadTransactions()
    expect(Array.isArray(tx)).toBe(true)
    expect(tx.length).toBeGreaterThan(0)
  })

  it('saves and retrieves transactions', () => {
    const data = [{ id: 't1', amount: 100, date: '2026-10-16' }]
    saveTransactions(data)
    const loaded = loadTransactions()
    expect(loaded[0].id).toBe('t1')
  })

  it('handles corrupted data gracefully', () => {
    localStorage.setItem(STORAGE_KEY, 'not-json')
    const loaded = loadTransactions()
    expect(Array.isArray(loaded)).toBe(true)
  })
})
