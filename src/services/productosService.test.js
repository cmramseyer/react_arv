import {
  getProductos,
  getProducto,
  createProducto,
  updateProducto,
  deleteProducto,
} from './productosService'

// Mockear fetch
globalThis.fetch = vi.fn()

beforeEach(() => {
  fetch.mockClear()
  localStorage.setItem('arv_token', 'fake-token')
})

describe('productosService', () => {
  it('getProductos realiza fetch a la URL correcta con headers', async () => {
    fetch.mockResolvedValueOnce({ json: async () => ([]) })

    await getProductos()

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/productos', expect.objectContaining({
      headers: expect.objectContaining({
        Authorization: expect.stringContaining('Bearer'),
      }),
    }))
  })

  it('getProducto realiza GET con id', async () => {
    fetch.mockResolvedValueOnce({ json: async () => ({}) })

    await getProducto(5)

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/productos/5', expect.objectContaining({
      headers: expect.objectContaining({
        Authorization: expect.stringContaining('Bearer'),
      }),
    }))
  })

  it('createProducto realiza POST con body json', async () => {
    const producto = { nombre: 'Glifosato', tipo_producto: 'Agroquimico' }

    fetch.mockResolvedValueOnce({})

    await createProducto(producto)

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/productos', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ producto }),
    }))
  })

  it('updateProducto realiza PATCH correctamente', async () => {
    const producto = { nombre: 'Producto Editado' }

    fetch.mockResolvedValueOnce({})

    await updateProducto(7, producto)

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/productos/7', expect.objectContaining({
      method: 'PATCH',
      body: JSON.stringify({ producto }),
    }))
  })

  it('deleteProducto realiza DELETE correctamente', async () => {
    fetch.mockResolvedValueOnce({})

    await deleteProducto(3)

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/productos/3', expect.objectContaining({
      method: 'DELETE',
    }))
  })
})
