import { http, HttpResponse } from 'msw'
 
const API_URL = `http://${import.meta.env.VITE_API_URL}`

export const estanciaHandlers = [
  http.get(`${API_URL}/estancias`, () => {
    return HttpResponse.json([
      {
        id: '1',
        nombre: 'Estancia Uno',
        contacto: 'Contacto Uno',
        telefono: '12345678',
        email: 'estancia@uno.com'
      },
      {
        id: '2',
        nombre: 'Estancia Dos',
        contacto: 'Contacto Dos',
        telefono: '123456789',
        email: 'estancia@dos.com'
      },
    ])
  }),
  http.get(`${API_URL}/estancias/:id`, async ({ params }) => {
    return HttpResponse.json({
      id: '1',
      nombre: 'Estancia Uno',
      contacto: 'Contacto Uno',
      telefono: '12345678',
      email: 'estancia@uno.com'
    })
  })
]
