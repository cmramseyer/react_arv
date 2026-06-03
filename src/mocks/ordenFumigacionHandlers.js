import { http, HttpResponse } from 'msw'

const API_URL = `http://${import.meta.env.VITE_API_URL}`

export const ordenFumigacionHandlers = [
  http.get(`${API_URL}/ordenes_fumigacion`, () => {
    return HttpResponse.json([
      {
        id: '1',
        nombre_estancia: 'Estancia Uno',
        nombre_lote: 'Lote Uno',
        estado_orden: 'pendiente',
        hectareas: 10,
        created_at_locale: '01/01/2025',
        creator: 'Tester',
      },
      {
        id: '2',
        nombre_estancia: 'Estancia Dos',
        nombre_lote: 'Lote Dos',
        estado_orden: 'terminada',
        hectareas: 25,
        created_at_locale: '02/01/2025',
        creator: 'Tester',
      },
    ])
  }),
  http.get(`${API_URL}/ordenes_fumigacion/:id`, async ({ params }) => {
    return HttpResponse.json({
      id: String(params.id),
      nombre_estancia: 'Estancia Uno',
      nombre_lote: 'Lote Uno',
      estado_orden: 'pendiente',
      hectareas: 10,
      created_at_locale: '01/01/2025',
      creator: 'Tester',
      sensible: false,
      comentarios: '',
      cultivo: { id: '1', nombre: 'Trigo' },
      lotes: [],
      facturas: [],
      maquinista: { id: '1', nombre: 'Pedro' },
      fecha_trabajo: '2025-01-01',
      fecha_trabajo_ddmmyyyy: '01/01/2025',
      datos_clima: '',
      info_trabajo: '',
      orden_url: null,
      orden_pdf_fecha_creacion: null,
    })
  }),
]
