import { http, HttpResponse } from 'msw'
 
const API_URL = `http://${import.meta.env.VITE_API_URL}`

export const handlers = [
  http.get(`${API_URL}/productos`, () => {
    return HttpResponse.json([
      {
        id: '1',
        nombre: 'Soja',
      },
      {
        id: '2',
        nombre: 'Trigo'
      }
    ])
  }),
  http.get(`${API_URL}/productos/:id`, async ({ params }) => {
    return HttpResponse.json({
      id: '1',
      nombre: 'Roundup',
      tipo_producto: 'Agroquímico',
      unidad_medida: 'litros'
    })
  })
]