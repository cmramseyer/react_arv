import {
  getEstancias,
  getEstancia,
  createEstancia,
  updateEstancia,
  deleteEstancia,
} from '@/features/estancias/api/estanciasService'

// Mockear fetch
globalThis.fetch = vi.fn()

beforeEach(() => {
  fetch.mockClear()
  localStorage.setItem('arv_token', 'fake-token')
})

describe.skip('estanciasService', () => {
  it('getEstancias realiza fetch a la URL correcta con headers', async () => {
    fetch.mockResolvedValueOnce({ json: async () => ([]) })

    await getEstancias()

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/estancias', expect.objectContaining({
      headers: expect.objectContaining({
        Authorization: expect.stringContaining('Bearer'),
      }),
    }))
  })

  it('getEstancia realiza GET con id', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) })

    await getEstancia(5)

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/estancias/5', expect.objectContaining({
      headers: expect.objectContaining({
        Authorization: expect.stringContaining('Bearer'),
      }),
    }))
  })

  it('getEstancia lanza error cuando response no es ok', async () => {
    fetch.mockResolvedValueOnce({ ok: false, json: async () => ({}) })

    await expect(getEstancia(99)).rejects.toThrow('Error fetching estancia')
  })

  it('createEstancia realiza POST con body json', async () => {
    const estancia = { nombre: 'Estancia Uno' }

    fetch.mockResolvedValueOnce({})

    await createEstancia(estancia)

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/estancias', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ estancia }),
    }))
  })

  it('updateEstancia realiza PATCH correctamente', async () => {
    const estancia = { nombre: 'Estancia Editada' }

    fetch.mockResolvedValueOnce({})

    await updateEstancia(7, estancia)

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/estancias/7', expect.objectContaining({
      method: 'PATCH',
      body: JSON.stringify({ estancia }),
    }))
  })

  it('deleteEstancia realiza DELETE correctamente', async () => {
    fetch.mockResolvedValueOnce({})

    await deleteEstancia(3)

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/estancias/3', expect.objectContaining({
      method: 'DELETE',
    }))
  })
})
