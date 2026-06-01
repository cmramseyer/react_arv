import { http, HttpResponse } from 'msw'
 
const API_URL = `http://${import.meta.env.VITE_API_URL}`

export const maquinistaHandlers = [
  http.get(`${API_URL}/maquinistas`, () => {
    return HttpResponse.json([
      {
        id: '1',
        nombre: 'Carlos',
      },
      {
        id: '2',
        nombre: 'Juan',
      }
    ])
  }),
  http.get(`${API_URL}/maquinistas/:id`, async ({ params }) => {
    return HttpResponse.json({
      id: '1',
      nombre: 'Carlos',
    })
  })
]

