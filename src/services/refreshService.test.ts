import { afterEach, describe, expect, it, vi } from 'vitest'
import { refreshSession } from './refreshService'

describe('refreshSession', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('uses cookies and does not parse a token response', async () => {
    const json = vi.fn()
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json })
    vi.stubGlobal('fetch', fetchMock)

    await refreshSession()

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/refresh', {
      method: 'POST',
      credentials: 'include',
    })
    expect(json).not.toHaveBeenCalled()
  })

  it('rejects an unsuccessful refresh', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))

    await expect(refreshSession()).rejects.toThrow('Refresh fallido')
  })
})
