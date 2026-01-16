import {
  getOrdenesFumigacion,
  getOrdenFumigacion,
  createOrdenFumigacion,
  updateOrdenFumigacion,
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

    await getOrdenesFumigacion('pendiente')

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
    const formData = new FormData()
    formData.append('orden[producto_id]', '1')

    fetch.mockResolvedValueOnce({})

    await createOrdenFumigacion(formData)

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/ordenes_fumigacion', expect.objectContaining({
      method: 'POST',
      body: formData
    }))
  })

  it('updateOrdenFumigacion realiza PATCH correctamente', async () => {
    const formData = new FormData()
    formData.append('orden[estado]', 'completada')

    fetch.mockResolvedValueOnce({})

    await updateOrdenFumigacion(1, formData)

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/ordenes_fumigacion/1', expect.objectContaining({
      method: 'PATCH',
      body: formData
    }))
  })

  it('terminarOrdenFumigacion realiza PATCH en /terminar', async () => {
    const formData = new FormData()
    formData.append('orden[notas]', 'Terminado')

    fetch.mockResolvedValueOnce({})

    await terminarOrdenFumigacion(2, formData)

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/ordenes_fumigacion/2/terminar', expect.objectContaining({
      method: 'PATCH',
      body: formData
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
