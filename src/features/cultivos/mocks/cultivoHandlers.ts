import { http, HttpResponse } from 'msw'
 
const API_URL = `http://${import.meta.env.VITE_API_URL}`

export const cultivoHandlers = [
  http.get(`${API_URL}/cultivos`, () => {
    return HttpResponse.json([
      {
        id: '1',
        nombre: 'Soja',
      },
      {
        id: '2',
        nombre: 'Trigo',
      }
    ])
  }),
  http.get(`${API_URL}/cultivos/:id`, async ({ params }) => {
    return HttpResponse.json({
      id: '1',
      nombre: 'Soja',
    })
  })
]
