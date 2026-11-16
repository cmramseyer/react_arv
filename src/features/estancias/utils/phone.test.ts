import { describe, expect, it } from 'vitest'
import {
  displayEstanciaPhone,
  isValidEstanciaPhone,
  maskEstanciaPhone,
  normalizeEstanciaPhone,
} from './phone'

describe('maskEstanciaPhone', () => {
  it('formats the acceptance case as an Argentine national number', () => {
    expect(maskEstanciaPhone('3462672842')).toBe('(3462) 67-2842')
  })

  it('formats two, three and four digit area codes', () => {
    expect(maskEstanciaPhone('1112345678')).toBe('(11) 1234-5678')
    expect(maskEstanciaPhone('3411234567')).toBe('(341) 123-4567')
    expect(maskEstanciaPhone('3462123456')).toBe('(3462) 12-3456')
  })

  it('degrades gracefully while the number is still incomplete', () => {
    expect(maskEstanciaPhone('')).toBe('')
    expect(maskEstanciaPhone('11')).toBe('11')
    expect(maskEstanciaPhone('111')).toBe('(11) 1')
    expect(maskEstanciaPhone('346267')).toBe('(3462) 67')
  })

  it('strips non-digits and rejects digits beyond the limit', () => {
    expect(maskEstanciaPhone('(3462) 67-2842')).toBe('(3462) 67-2842')
    expect(maskEstanciaPhone('34a62 67.2842')).toBe('(3462) 67-2842')
    expect(maskEstanciaPhone('346267284299')).toBe('(3462) 67-2842')
  })
})

describe('normalizeEstanciaPhone', () => {
  it('returns only digits so the API receives the national number', () => {
    expect(normalizeEstanciaPhone('(3462) 67-2842')).toBe('3462672842')
    expect(normalizeEstanciaPhone('')).toBe('')
    expect(normalizeEstanciaPhone(null)).toBe('')
  })
})

describe('isValidEstanciaPhone', () => {
  it('accepts an empty value because the field is optional', () => {
    expect(isValidEstanciaPhone('')).toBe(true)
    expect(isValidEstanciaPhone(undefined)).toBe(true)
  })

  it('accepts exactly ten digits with or without separators', () => {
    expect(isValidEstanciaPhone('3462672842')).toBe(true)
    expect(isValidEstanciaPhone('(3462) 67-2842')).toBe(true)
  })

  it('rejects incomplete or overlong numbers', () => {
    expect(isValidEstanciaPhone('346267284')).toBe(false)
    expect(isValidEstanciaPhone('34626728429')).toBe(false)
  })
})

describe('displayEstanciaPhone', () => {
  it('formats stored valid numbers and leaves legacy values untouched', () => {
    expect(displayEstanciaPhone('3462672842')).toBe('(3462) 67-2842')
    expect(displayEstanciaPhone('12345678')).toBe('12345678')
    expect(displayEstanciaPhone(null)).toBe('')
  })
})
