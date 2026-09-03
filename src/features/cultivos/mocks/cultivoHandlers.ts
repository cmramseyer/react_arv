import { http, HttpResponse } from 'msw'
import { apiBaseUrl } from '@/services/apiUrl'

const API_URL = apiBaseUrl

type CultivoMock = {
  id: string
  nombre: string
}

type CultivoRequestBody = {
  cultivo: Omit<CultivoMock, 'id'>
}

const initialCultivos: CultivoMock[] = [
  {
    id: '1',
    nombre: 'Soja',
  },
  {
    id: '2',
    nombre: 'Trigo',
  }
]

let cultivos = [...initialCultivos]

export const resetCultivoMocks = () => {
  cultivos = [...initialCultivos]
}

const findCultivo = (id: unknown) => cultivos.find((cultivo) => cultivo.id === String(id))

const nextCultivoId = () => String(Math.max(0, ...cultivos.map((cultivo) => Number(cultivo.id))) + 1)

export const cultivoHandlers = [
  http.get(`${API_URL}/cultivos`, () => {
    return HttpResponse.json(cultivos)
  }),
  http.get(`${API_URL}/cultivos/:id`, ({ params }) => {
    const cultivo = findCultivo(params.id)

    if (!cultivo) {
      return HttpResponse.json({ error: 'Cultivo no encontrado' }, { status: 404 })
    }

    return HttpResponse.json(cultivo)
  }),
  http.post(`${API_URL}/cultivos`, async ({ request }) => {
    const body = await request.json() as CultivoRequestBody
    const cultivo = {
      id: nextCultivoId(),
      ...body.cultivo,
    }

    cultivos = [...cultivos, cultivo]

    return HttpResponse.json(cultivo, { status: 201 })
  }),
  http.patch(`${API_URL}/cultivos/:id`, async ({ params, request }) => {
    const body = await request.json() as CultivoRequestBody
    const cultivo = findCultivo(params.id)

    if (!cultivo) {
      return HttpResponse.json({ error: 'Cultivo no encontrado' }, { status: 404 })
    }

    const updatedCultivo = {
      ...cultivo,
      ...body.cultivo,
      id: String(params.id),
    }

    cultivos = cultivos.map((currentCultivo) => (
      currentCultivo.id === String(params.id) ? updatedCultivo : currentCultivo
    ))

    return HttpResponse.json(updatedCultivo)
  }),
  http.delete(`${API_URL}/cultivos/:id`, ({ params }) => {
    const cultivo = findCultivo(params.id)

    if (!cultivo) {
      return HttpResponse.json({ error: 'Cultivo no encontrado' }, { status: 404 })
    }

    cultivos = cultivos.filter((currentCultivo) => currentCultivo.id !== String(params.id))

    return new HttpResponse(null, { status: 204 })
  })
]
