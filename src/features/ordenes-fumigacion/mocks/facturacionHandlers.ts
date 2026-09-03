import { http, HttpResponse } from 'msw'
import { apiBaseUrl } from '@/services/apiUrl'

const API_URL = apiBaseUrl

export const facturacionHandlers = [
  http.get(`${API_URL}/facturas_pago`, () => {
    return HttpResponse.json([
      {
        id: '1',
        fecha_factura_ddmmyyyy: '10/01/2026',
        nro_factura: 'FAC-2026-001',
        ordenes_fumigacion: [
          {
            orden_id: 101,
            lote_id: 'Lote A',
            hectareas: 10,
            fecha_trabajo_ddmmyyyy: '08/01/2026',
            maquinista: 'Juan Perez',
            nombre_estancia: 'Estancia Alfa',
            importe: '150000,00',
          },
        ],
      },
      {
        id: '2',
        fecha_factura_ddmmyyyy: '11/01/2026',
        nro_factura: 'FAC-2026-002',
        ordenes_fumigacion: [
          {
            orden_id: 202,
            lote_id: 'Lote B',
            hectareas: 8,
            fecha_trabajo_ddmmyyyy: '09/01/2026',
            maquinista: 'Maria Lopez',
            nombre_estancia: 'Estancia Beta',
            importe: '98000,00',
          },
        ],
      },
    ])
  }),
  http.patch(`${API_URL}/facturas/:id`, async ({ request }) => {
    const { fecha_pago } = await request.json() as { fecha_pago?: string }

    if (!fecha_pago) {
      return HttpResponse.json(
        { fecha_pago: ['es requerida'] },
        { status: 422 },
      )
    }

    return new HttpResponse(null, { status: 204 })
  }),
]
