import { http, HttpResponse } from 'msw'
import type { Lote } from '@/features/lotes/types'

const API_URL = `http://${import.meta.env.VITE_API_URL}`

const initialLotes: Lote[] = [
  {
    id: 1,
    nombre: 'Lote Uno',
    nombre_estancia: 'Estancia Uno',
    estancia_id: 1,
    lat: '34.6037',
    long: '58.3816',
    link_mapa: 'https://maps.example.com/lote-uno',
    hectareas: 10,
    adjuntos: [
      {
        id: '101',
        filename: 'plano-lote-uno.png',
        url: 'http://localhost:3000/uploads/plano-lote-uno.png',
      },
      {
        id: '102',
        filename: 'analisis-lote-uno.pdf',
        url: 'http://localhost:3000/uploads/analisis-lote-uno.pdf',
      },
    ],
  },
  {
    id: 2,
    nombre: 'Lote Dos',
    nombre_estancia: 'Estancia Dos',
    estancia_id: 2,
    lat: '32.9442',
    long: '60.6505',
    link_mapa: 'https://maps.example.com/lote-dos',
    hectareas: 25,
    adjuntos: [],
  },
]

let lotes = structuredClone(initialLotes)

export const resetLoteMocks = () => {
  lotes = structuredClone(initialLotes)
}

const findLoteById = (id: unknown) => lotes.find((lote) => String(lote.id) === String(id))

const nextLoteId = () => Math.max(0, ...lotes.map((lote) => Number(lote.id))) + 1

const estanciaName = (estanciaId: number | string | FormDataEntryValue | null) => {
  if (String(estanciaId) === '2') return 'Estancia Dos'
  return 'Estancia Uno'
}

const loteFromFormData = (formData: FormData, existingLote?: Lote): Lote => {
  const estanciaId = formData.get('lote[estancia_id]') ?? existingLote?.estancia_id ?? 1
  const hectareas = Number(formData.get('lote[hectareas]') ?? existingLote?.hectareas ?? 0)

  return {
    id: existingLote?.id ?? nextLoteId(),
    nombre: String(formData.get('lote[nombre]') ?? existingLote?.nombre ?? ''),
    nombre_estancia: estanciaName(estanciaId),
    estancia_id: String(estanciaId),
    lat: String(formData.get('lote[lat]') ?? existingLote?.lat ?? ''),
    long: String(formData.get('lote[long]') ?? existingLote?.long ?? ''),
    link_mapa: String(formData.get('lote[link_mapa]') ?? existingLote?.link_mapa ?? ''),
    hectareas,
    adjuntos: existingLote?.adjuntos ?? [],
  }
}

export const loteHandlers = [
  http.get(`${API_URL}/lotes`, ({ request }) => {
    const url = new URL(request.url)
    const estanciaId = url.searchParams.get('estancia_id')

    if (estanciaId) {
      return HttpResponse.json(lotes.filter((lote) => String(lote.estancia_id) === estanciaId))
    }

    return HttpResponse.json(lotes)
  }),

  http.get(`${API_URL}/lotes/:id`, ({ params }) => {
    const lote = findLoteById(params.id)

    if (!lote) {
      return HttpResponse.json({ error: 'Lote no encontrado' }, { status: 404 })
    }

    return HttpResponse.json(lote)
  }),

  http.post(`${API_URL}/lotes`, async ({ request }) => {
    const formData = await request.formData()
    const lote = loteFromFormData(formData)

    lotes = [...lotes, lote]

    return HttpResponse.json(lote, { status: 201 })
  }),

  http.patch(`${API_URL}/lotes/:id`, async ({ params, request }) => {
    const lote = findLoteById(params.id)

    if (!lote) {
      return HttpResponse.json({ error: 'Lote no encontrado' }, { status: 404 })
    }

    const formData = await request.formData()
    const updatedLote = loteFromFormData(formData, lote)

    lotes = lotes.map((currentLote) => (
      String(currentLote.id) === String(params.id) ? updatedLote : currentLote
    ))

    return HttpResponse.json(updatedLote)
  }),

  http.delete(`${API_URL}/lotes/:id`, ({ params }) => {
    const lote = findLoteById(params.id)

    if (!lote) {
      return HttpResponse.json({ error: 'Lote no encontrado' }, { status: 404 })
    }

    lotes = lotes.filter((currentLote) => String(currentLote.id) !== String(params.id))

    return new HttpResponse(null, { status: 204 })
  }),

  http.get(`${API_URL}/lotes/:id/adjuntos`, ({ params }) => {
    const lote = findLoteById(params.id)

    if (!lote) {
      return HttpResponse.json({ error: 'Lote no encontrado' }, { status: 404 })
    }

    return HttpResponse.json(lote.adjuntos)
  }),

  http.post(`${API_URL}/lotes/:id/adjuntos`, ({ params }) => {
    return HttpResponse.json({
      id: '999',
      lote_id: String(params.id),
      filename: 'nuevo-adjunto.png',
      url: 'http://localhost:3000/uploads/nuevo-adjunto.png',
    }, { status: 201 })
  }),

  http.delete(`${API_URL}/lotes/:loteId/adjuntos/:adjuntoId`, ({ params }) => {
    return HttpResponse.json({
      lote_id: String(params.loteId),
      adjunto_id: String(params.adjuntoId),
      ok: true,
    })
  }),
]
