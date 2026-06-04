import {
  getOrdenesFumigacion,
  getOrdenFumigacion,
  createOrdenFumigacion,
  updateOrdenFumigacion,
  updateAdjuntoOrdenFumigacion,
  terminarOrdenFumigacion,
  deleteOrdenFumigacion,
  imprimirOrdenFumigacion,
} from './ordenesFumigacionService'

// Mockear fetch
globalThis.fetch = vi.fn()

beforeEach(() => {
  fetch.mockClear()
  localStorage.setItem('arv_token', 'fake-token')
})

describe('ordenesFumigacionService', () => {
  it('getOrdenesFumigacion realiza fetch a la URL correcta con headers', async () => {
    fetch.mockResolvedValueOnce({ json: async () => ([]) })

    await getOrdenesFumigacion({ estado: 'pendiente' })

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/ordenes_fumigacion?estado=pendiente', expect.objectContaining({
      headers: expect.objectContaining({
        Authorization: expect.stringContaining('Bearer')
      })
    }))
  })

  it('getOrdenFumigacion realiza GET con id', async () => {
    fetch.mockResolvedValueOnce({ json: async () => ({}) })

    await getOrdenFumigacion(5)

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/ordenes_fumigacion/5', expect.objectContaining({
      headers: expect.objectContaining({
        Authorization: expect.stringContaining('Bearer')
      })
    }))
  })

  it('createOrdenFumigacion realiza POST con data', async () => {
    const payload = { orden_fumigacion: { estancia_id: 1, lotes: [] } }

    fetch.mockResolvedValueOnce({})

    await createOrdenFumigacion(payload)

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/ordenes_fumigacion', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify(payload),
      headers: expect.objectContaining({
        'Content-Type': 'application/json'
      })
    }))
  })

  it('updateOrdenFumigacion realiza PATCH correctamente', async () => {
    const payload = { orden_fumigacion: { lotes: [] } }

    fetch.mockResolvedValueOnce({})

    await updateOrdenFumigacion(1, payload)

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/ordenes_fumigacion/1', expect.objectContaining({
      method: 'PATCH',
      body: JSON.stringify(payload),
      headers: expect.objectContaining({
        'Content-Type': 'application/json'
      })
    }))
  })

  it('updateAdjuntoOrdenFumigacion realiza PATCH con FormData', async () => {
    const file = new File(['contenido'], 'plano.png', { type: 'image/png' })

    fetch.mockResolvedValueOnce({})

    await updateAdjuntoOrdenFumigacion(6, file)

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/ordenes_fumigacion/6', expect.objectContaining({
      method: 'PATCH',
      body: expect.any(FormData),
      headers: expect.objectContaining({
        Authorization: expect.stringContaining('Bearer')
      })
    }))

    const [, requestOptions] = fetch.mock.calls.at(-1)
    expect(requestOptions.body.get('orden_fumigacion[adjuntos][]')).toBe(file)
  })

  it('terminarOrdenFumigacion realiza PATCH en /terminar', async () => {
    const payload = { orden_fumigacion: { notas: 'Terminado' } }

    fetch.mockResolvedValueOnce({})

    await terminarOrdenFumigacion(2, payload)

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/ordenes_fumigacion/2/terminar', expect.objectContaining({
      method: 'PATCH',
      body: JSON.stringify(payload),
      headers: expect.objectContaining({
        'Content-Type': 'application/json'
      })
    }))
  })

  it('deleteOrdenFumigacion realiza DELETE correctamente', async () => {
    fetch.mockResolvedValueOnce({})

    await deleteOrdenFumigacion(3)

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/ordenes_fumigacion/3', expect.objectContaining({
      method: 'DELETE'
    }))
  })

  it('imprimirOrdenFumigacion realiza GET en /pdf', async () => {
    fetch.mockResolvedValueOnce({ json: async () => ({ pdf: 'data' }) })

    await imprimirOrdenFumigacion(4)

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/ordenes_fumigacion/4/pdf', expect.objectContaining({
      headers: expect.objectContaining({
        Authorization: expect.stringContaining('Bearer')
      })
    }))
  })
})
