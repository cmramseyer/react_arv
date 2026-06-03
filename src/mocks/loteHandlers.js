import { http, HttpResponse } from 'msw'

const API_URL = `http://${import.meta.env.VITE_API_URL}`

const lotes = [
  {
    id: '1',
    nombre: 'Lote Uno',
    nombre_estancia: 'Estancia Uno',
    estancia_id: '1',
    lat: '-34.6037',
    long: '-58.3816',
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
    id: '2',
    nombre: 'Lote Dos',
    nombre_estancia: 'Estancia Dos',
    estancia_id: '2',
    lat: '-32.9442',
    long: '-60.6505',
    link_mapa: 'https://maps.example.com/lote-dos',
    hectareas: 25,
    adjuntos: [],
  },
]

const findLote = (id) => lotes.find((lote) => lote.id === String(id))

export const loteHandlers = [
  http.get(`${API_URL}/lotes`, ({ request }) => {
    const url = new URL(request.url)
    const estanciaId = url.searchParams.get('estancia_id')

    if (estanciaId) {
      return HttpResponse.json(lotes.filter((lote) => lote.estancia_id === estanciaId))
    }

    return HttpResponse.json(lotes)
  }),

  http.get(`${API_URL}/lotes/:id`, ({ params }) => {
    const lote = findLote(params.id)

    if (!lote) {
      return HttpResponse.json({ error: 'Lote no encontrado' }, { status: 404 })
    }

    return HttpResponse.json(lote)
  }),

  http.post(`${API_URL}/lotes`, async () => {
    return HttpResponse.json({ id: '3', ok: true }, { status: 201 })
  }),

  http.patch(`${API_URL}/lotes/:id`, ({ params }) => {
    return HttpResponse.json({ id: String(params.id), ok: true })
  }),

  http.delete(`${API_URL}/lotes/:id`, ({ params }) => {
    return HttpResponse.json({ id: String(params.id), ok: true })
  }),

  http.get(`${API_URL}/lotes/:id/adjuntos`, ({ params }) => {
    const lote = findLote(params.id)

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
