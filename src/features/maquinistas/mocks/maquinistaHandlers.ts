import { http, HttpResponse } from 'msw'
import { apiBaseUrl } from '@/services/apiUrl'

const API_URL = apiBaseUrl

type MaquinistaMock = {
  id: string
  nombre: string
}

type MaquinistaRequestBody = {
  maquinista: Omit<MaquinistaMock, 'id'>
}

const initialMaquinistas: MaquinistaMock[] = [
  {
    id: '1',
    nombre: 'Carlos',
  },
  {
    id: '2',
    nombre: 'Juan',
  }
]

let maquinistas = [...initialMaquinistas]

export const resetMaquinistaMocks = () => {
  maquinistas = [...initialMaquinistas]
}

const findMaquinista = (id: unknown) => maquinistas.find((maquinista) => maquinista.id === String(id))

const nextMaquinistaId = () => String(Math.max(0, ...maquinistas.map((maquinista) => Number(maquinista.id))) + 1)

export const maquinistaHandlers = [
  http.get(`${API_URL}/maquinistas`, () => {
    return HttpResponse.json(maquinistas)
  }),
  http.get(`${API_URL}/maquinistas/:id`, ({ params }) => {
    const maquinista = findMaquinista(params.id)

    if (!maquinista) {
      return HttpResponse.json({ error: 'Maquinista no encontrado' }, { status: 404 })
    }

    return HttpResponse.json(maquinista)
  }),
  http.post(`${API_URL}/maquinistas`, async ({ request }) => {
    const body = await request.json() as MaquinistaRequestBody
    const maquinista = {
      id: nextMaquinistaId(),
      ...body.maquinista,
    }

    maquinistas = [...maquinistas, maquinista]

    return HttpResponse.json(maquinista, { status: 201 })
  }),
  http.patch(`${API_URL}/maquinistas/:id`, async ({ params, request }) => {
    const body = await request.json() as MaquinistaRequestBody
    const maquinista = findMaquinista(params.id)

    if (!maquinista) {
      return HttpResponse.json({ error: 'Maquinista no encontrado' }, { status: 404 })
    }

    const updatedMaquinista = {
      ...maquinista,
      ...body.maquinista,
      id: String(params.id),
    }

    maquinistas = maquinistas.map((currentMaquinista) => (
      currentMaquinista.id === String(params.id) ? updatedMaquinista : currentMaquinista
    ))

    return HttpResponse.json(updatedMaquinista)
  }),
  http.delete(`${API_URL}/maquinistas/:id`, ({ params }) => {
    const maquinista = findMaquinista(params.id)

    if (!maquinista) {
      return HttpResponse.json({ error: 'Maquinista no encontrado' }, { status: 404 })
    }

    maquinistas = maquinistas.filter((currentMaquinista) => currentMaquinista.id !== String(params.id))

    return new HttpResponse(null, { status: 204 })
  })
]
