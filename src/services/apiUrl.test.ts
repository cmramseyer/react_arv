import { describe, expect, it } from 'vitest'

import { normalizeApiBaseUrl } from './apiUrl'

describe('normalizeApiBaseUrl', () => {
  it('uses the reverse-proxy path when no API URL is configured', () => {
    expect(normalizeApiBaseUrl()).toBe('/api')
    expect(normalizeApiBaseUrl('')).toBe('/api')
  })

  it('preserves an absolute local API URL without a trailing slash', () => {
    expect(normalizeApiBaseUrl('http://localhost:3000/')).toBe('http://localhost:3000')
  })
})
