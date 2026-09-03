import { http, HttpResponse } from 'msw'
import { apiBaseUrl } from '@/services/apiUrl'

const API_URL = apiBaseUrl

type ProductoMock = {
  id: string
  nombre: string
  tipo_producto: string
  unidad_medida: string
}

type ProductoRequestBody = {
  producto: Omit<ProductoMock, 'id'>
}

const initialProductos: ProductoMock[] = [
  {
    id: '1',
    nombre: 'Roundup',
    tipo_producto: 'Agroquímico',
    unidad_medida: 'kg'
  },
  {
    id: '2',
    nombre: '2-4D',
    tipo_producto: 'Agroquímico',
    unidad_medida: 'litros'
  }
]

let productos = [...initialProductos]

export const resetProductoMocks = () => {
  productos = [...initialProductos]
}

const findProducto = (id: unknown) => productos.find((producto) => producto.id === String(id))

const nextProductoId = () => String(Math.max(0, ...productos.map((producto) => Number(producto.id))) + 1)

export const productoHandlers = [
  http.get(`${API_URL}/productos`, () => {
    return HttpResponse.json(productos)
  }),
  http.get(`${API_URL}/productos/:id`, ({ params }) => {
    const producto = findProducto(params.id)

    if (!producto) {
      return HttpResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    return HttpResponse.json(producto)
  }),
  http.post(`${API_URL}/productos`, async ({ request }) => {
    const body = await request.json() as ProductoRequestBody
    const producto = {
      id: nextProductoId(),
      ...body.producto,
    }

    productos = [...productos, producto]

    return HttpResponse.json(producto, { status: 201 })
  }),
  http.patch(`${API_URL}/productos/:id`, async ({ params, request }) => {
    const body = await request.json() as ProductoRequestBody
    const producto = findProducto(params.id)

    if (!producto) {
      return HttpResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    const updatedProducto = {
      ...producto,
      ...body.producto,
      id: String(params.id),
    }

    productos = productos.map((currentProducto) => (
      currentProducto.id === String(params.id) ? updatedProducto : currentProducto
    ))

    return HttpResponse.json(updatedProducto)
  }),
  http.delete(`${API_URL}/productos/:id`, ({ params }) => {
    const producto = findProducto(params.id)

    if (!producto) {
      return HttpResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    productos = productos.filter((currentProducto) => currentProducto.id !== String(params.id))

    return new HttpResponse(null, { status: 204 })
  })
]
