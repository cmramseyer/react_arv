import { http, HttpResponse } from 'msw'
import type { Estancia } from '@/features/estancias/types'
import type { EstanciaFormValues } from '@/features/estancias/schemas/estanciaSchema'
  
const API_URL = `http://${import.meta.env.VITE_API_URL}`

type EstanciaRequestBody = {
  estancia: EstanciaFormValues
}

const initialEstancias: Estancia[] = [
  {
    id: 1,
    nombre: 'Estancia Uno',
    contacto: 'Contacto Uno',
    telefono: '12345678',
    email: 'estancia@uno.com',
    created_at: null,
    updated_at: null,
  },
  {
    id: 2,
    nombre: 'Estancia Dos',
    contacto: 'Contacto Dos',
    telefono: '123456789',
    email: 'estancia@dos.com',
    created_at: null,
    updated_at: null,
  },
]

let estancias = [...initialEstancias]

export const resetEstanciaMocks = () => {
  estancias = [...initialEstancias]
}

const findEstancia = (id: unknown) => estancias.find((estancia) => String(estancia.id) === String(id))

const nextEstanciaId = () => Math.max(0, ...estancias.map((estancia) => Number(estancia.id))) + 1

export const estanciaHandlers = [
  http.get(`${API_URL}/estancias`, () => {
    return HttpResponse.json(estancias)
  }),
  http.get(`${API_URL}/estancias/:id`, ({ params }) => {
    const estancia = findEstancia(params.id)

    if (!estancia) {
      return HttpResponse.json({ error: 'Estancia no encontrada' }, { status: 404 })
    }

    return HttpResponse.json(estancia)
  }),
  http.post(`${API_URL}/estancias`, async ({ request }) => {
    const body = await request.json() as EstanciaRequestBody
    const estancia = {
      id: nextEstanciaId(),
      nombre: body.estancia.nombre,
      contacto: body.estancia.contacto || null,
      telefono: body.estancia.telefono || null,
      email: body.estancia.email || null,
      created_at: null,
      updated_at: null,
    }

    estancias = [...estancias, estancia]

    return HttpResponse.json(estancia, { status: 201 })
  }),
  http.patch(`${API_URL}/estancias/:id`, async ({ params, request }) => {
    const body = await request.json() as EstanciaRequestBody
    const estancia = findEstancia(params.id)

    if (!estancia) {
      return HttpResponse.json({ error: 'Estancia no encontrada' }, { status: 404 })
    }

    const updatedEstancia = {
      ...estancia,
      nombre: body.estancia.nombre,
      contacto: body.estancia.contacto || null,
      telefono: body.estancia.telefono || null,
      email: body.estancia.email || null,
    }

    estancias = estancias.map((currentEstancia) => (
      String(currentEstancia.id) === String(params.id) ? updatedEstancia : currentEstancia
    ))

    return HttpResponse.json(updatedEstancia)
  }),
  http.delete(`${API_URL}/estancias/:id`, ({ params }) => {
    const estancia = findEstancia(params.id)

    if (!estancia) {
      return HttpResponse.json({ error: 'Estancia no encontrada' }, { status: 404 })
    }

    estancias = estancias.filter((currentEstancia) => String(currentEstancia.id) !== String(params.id))

    return new HttpResponse(null, { status: 204 })
  })
]
