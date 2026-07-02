import { getLotes, getLotesPorEstancia, createLote, updateLote, deleteLote, getLote } from '@/features/lotes/api/lotesService'

// Mockear fetch
globalThis.fetch = vi.fn()

beforeEach(() => {
  fetch.mockClear()
  localStorage.setItem('arv_token', 'fake-token')
})

describe.skip('loteService', () => {
  it('getLotes realiza fetch a la URL correcta con headers', async () => {
    fetch.mockResolvedValueOnce({ json: async () => ([]) })

    await getLotes()

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/lotes', expect.objectContaining({
      headers: expect.objectContaining({
        Authorization: expect.stringContaining('Bearer')
      })
    }))
  })

  it('getLotesPorEstancia realiza fetch con estancia_id', async () => {
    fetch.mockResolvedValueOnce({ json: async () => ([]) })

    await getLotesPorEstancia(4)

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/lotes?estancia_id=4', expect.objectContaining({
      headers: expect.objectContaining({
        Authorization: expect.stringContaining('Bearer')
      })
    }))
  })

  it('createLote realiza POST con FormData', async () => {
    const formData = new FormData()
    formData.append('lote[nombre]', 'Test Lote')

    fetch.mockResolvedValueOnce({})

    await createLote(formData)

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/lotes', expect.objectContaining({
      method: 'POST',
      body: formData
    }))
  })

  it('getLote realiza GET con id', async () => {
    fetch.mockResolvedValueOnce({ json: async () => ({}) })

    await getLote(5)

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/lotes/5', expect.objectContaining({
      headers: expect.objectContaining({
        Authorization: expect.stringContaining('Bearer')
      })
    }))
  })

  it('updateLote realiza PATCH correctamente', async () => {
    const formData = new FormData()
    formData.append('lote[nombre]', 'Nuevo Nombre')

    fetch.mockResolvedValueOnce({})

    await updateLote(1, formData)

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/lotes/1', expect.objectContaining({
      method: 'PATCH',
      body: formData
    }))
  })

  it('deleteLote realiza DELETE correctamente', async () => {
    fetch.mockResolvedValueOnce({})

    await deleteLote(2)

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/lotes/2', expect.objectContaining({
      method: 'DELETE'
    }))
  })
})
