import { http, HttpResponse } from 'msw'
import { apiBaseUrl } from '@/services/apiUrl'
import type {
  FacturarOrdenesPayload,
  OrdenFumigacion,
  OrdenFumigacionListItem,
  OrdenFumigacionPayload,
  OrdenFumigacionTerminarPayload,
} from '@/features/ordenes-fumigacion/types'

const API_URL = apiBaseUrl

type OrdenFumigacionRequestBody = {
  orden_fumigacion?: Partial<OrdenFumigacionPayload['orden_fumigacion']>
}

type OrdenFumigacionTerminarRequestBody = {
  orden_fumigacion?: OrdenFumigacionTerminarPayload['orden_fumigacion']
}

const initialOrdenes: OrdenFumigacion[] = [
  {
    id: '1',
    estancia_id: '1',
    nombre_estancia: 'Estancia Uno',
    nombre_lote: 'Lote Uno',
    estado_orden: 'activa',
    hectareas: 10,
    created_at_locale: '01/01/2025',
    creator: 'Tester',
    sensible: false,
    comentarios: '',
    cultivo: { id: '2', nombre: 'Trigo' },
    lotes: [
      {
        id: '101',
        lote_id: '1',
        nombre: 'Lote Uno',
        hectareas: 10,
        dosis: [
          {
            id: '1001',
            producto_id: '1',
            producto: 'Roundup',
            cantidad: 2,
            unidad_medida: 'kg',
          },
        ],
      },
    ],
    facturas: [],
    maquinista: { id: '1', nombre: 'Pedro' },
    fecha_trabajo: '2025-01-01',
    fecha_trabajo_ddmmyyyy: '01/01/2025',
    datos_clima: '',
    info_trabajo: '',
    orden_url: null,
    orden_pdf_fecha_creacion: null,
    adjuntos: [],
  },
  {
    id: '2',
    estancia_id: '2',
    nombre_estancia: 'Estancia Dos',
    nombre_lote: 'Lote Dos',
    estado_orden: 'terminada',
    hectareas: 25,
    created_at_locale: '02/01/2025',
    creator: 'Tester',
    sensible: false,
    comentarios: 'Orden terminada',
    cultivo: { id: '1', nombre: 'Soja' },
    lotes: [
      {
        id: '102',
        lote_id: '2',
        nombre: 'Lote Dos',
        hectareas: 25,
        hectareas_reales: 24,
        dosis: [
          {
            id: '1002',
            producto_id: '2',
            producto: '2-4D',
            cantidad: 1.5,
            unidad_medida: 'litros',
          },
        ],
      },
    ],
    facturas: [
      {
        nro_factura: 'FAC-2026-001',
        fecha_factura: '2026-01-10',
      },
    ],
    maquinista: { id: '2', nombre: 'Juan' },
    fecha_trabajo: '2025-01-02',
    fecha_trabajo_ddmmyyyy: '02/01/2025',
    datos_clima: '',
    info_trabajo: 'Trabajo terminado',
    orden_url: 'http://localhost:3000/ordenes/2.pdf',
    orden_pdf_fecha_creacion: '2025-01-03',
    adjuntos: [],
  },
]

let ordenes = structuredClone(initialOrdenes)

export const resetOrdenFumigacionMocks = () => {
  ordenes = structuredClone(initialOrdenes)
}

const findOrden = (id: unknown) => ordenes.find((orden) => orden.id === String(id))

const nextOrdenId = () => String(Math.max(0, ...ordenes.map((orden) => Number(orden.id))) + 1)

const listOrden = (orden: OrdenFumigacion): OrdenFumigacionListItem => ({
  id: orden.id,
  estancia_id: orden.estancia_id,
  nombre_estancia: orden.nombre_estancia,
  lotes_ids: orden.lotes_ids ?? orden.lotes?.flatMap((lote) => lote.lote_id ? [lote.lote_id] : []) ?? [],
  nombre_lote: orden.nombre_lote,
  estado_orden: orden.estado_orden,
  hectareas: orden.hectareas,
  hectareas_reales: orden.hectareas_reales,
  created_at_locale: orden.created_at_locale,
  creator: orden.creator,
  cultivo: orden.cultivo,
  lotes: orden.lotes,
  facturas: orden.facturas,
  maquinista: orden.maquinista,
  fecha_trabajo_ddmmyyyy: orden.fecha_trabajo_ddmmyyyy,
})

const normalizePayloadToOrden = (
  payload: OrdenFumigacionRequestBody['orden_fumigacion'] = {},
  existingOrden?: OrdenFumigacion,
): OrdenFumigacion => {
  const id = existingOrden?.id ?? nextOrdenId()
  const estanciaId = String(payload.estancia_id ?? existingOrden?.estancia_id ?? '1')
  const cultivoId = payload.cultivo_id ? String(payload.cultivo_id) : existingOrden?.cultivo?.id
  const payloadLotes = Array.isArray(payload.lotes) ? payload.lotes : []
  const existingLotes = existingOrden?.lotes ?? []
  const deletedLoteIds = new Set(
    payloadLotes
      .filter((lote) => '_destroy' in lote && lote._destroy)
      .map((lote) => String(lote.id)),
  )
  const normalizedLotes = payloadLotes
    .filter((lote) => !('_destroy' in lote && lote._destroy))
    .map((lote, index) => {
      const existingLote = lote.id
        ? existingLotes.find((currentLote) => String(currentLote.id) === String(lote.id))
        : undefined
      const isManual = 'nombre_manual' in lote
      const loteId = isManual || !('lote_id' in lote) ? null : String(lote.lote_id)
      const hectareasReales = 'hectareas_reales' in lote
        ? lote.hectareas_reales
        : existingLote?.hectareas_reales
      const hectareas = hectareasReales ?? existingLote?.hectareas ?? 10
      const dosisPayload = 'dosis' in lote ? lote.dosis : existingLote?.dosis ?? []

      return {
        id: String(lote.id ?? existingLote?.id ?? `${id}-${index + 1}`),
        lote_id: loteId,
        es_manual: isManual,
        nombre: isManual
          ? lote.nombre_manual
          : existingLote?.nombre ?? `Lote ${loteId}`,
        hectareas,
        hectareas_reales: hectareasReales,
        estancia_id: estanciaId,
        nombre_estancia: existingOrden?.nombre_estancia ?? `Estancia ${estanciaId}`,
        dosis: dosisPayload.map((dosis, dosisIndex) => ({
          id: String(dosis.id ?? existingLote?.dosis?.[dosisIndex]?.id ?? `${id}-${index + 1}-${dosisIndex + 1}`),
          producto_id: String(dosis.producto_id),
          producto: existingLote?.dosis?.[dosisIndex]?.producto ?? `Producto ${dosis.producto_id}`,
          cantidad: Number(dosis.cantidad),
          unidad_medida: existingLote?.dosis?.[dosisIndex]?.unidad_medida,
        })),
      }
    })
  const lotes = payloadLotes.length > 0
    ? normalizedLotes
    : existingLotes.filter((lote) => !deletedLoteIds.has(String(lote.id)))
  const totalHectareas = lotes.reduce((total, lote) => total + Number(lote.hectareas_reales ?? lote.hectareas ?? 0), 0)

  return {
    id,
    estancia_id: estanciaId,
    nombre_estancia: existingOrden?.nombre_estancia ?? `Estancia ${estanciaId}`,
    lotes_ids: lotes.flatMap((lote) => lote.lote_id ? [lote.lote_id] : []),
    nombre_lote: lotes.map((lote) => lote.nombre).join(', ') || existingOrden?.nombre_lote || 'Sin lotes',
    estado_orden: existingOrden?.estado_orden ?? 'activa',
    hectareas: totalHectareas || (existingOrden?.hectareas ?? 0),
    created_at_locale: existingOrden?.created_at_locale ?? '01/01/2025',
    creator: existingOrden?.creator ?? 'Tester',
    sensible: payload.sensible ?? existingOrden?.sensible ?? false,
    comentarios: payload.comentarios ?? existingOrden?.comentarios ?? '',
    cultivo: cultivoId ? { id: cultivoId, nombre: cultivoId === '1' ? 'Soja' : 'Trigo' } : existingOrden?.cultivo,
    lotes,
    facturas: existingOrden?.facturas ?? [],
    maquinista: existingOrden?.maquinista,
    fecha_trabajo: existingOrden?.fecha_trabajo,
    fecha_trabajo_ddmmyyyy: existingOrden?.fecha_trabajo_ddmmyyyy,
    datos_clima: existingOrden?.datos_clima ?? '',
    info_trabajo: existingOrden?.info_trabajo ?? '',
    orden_url: existingOrden?.orden_url ?? null,
    orden_pdf_fecha_creacion: existingOrden?.orden_pdf_fecha_creacion ?? null,
    adjuntos: existingOrden?.adjuntos ?? [],
  }
}

const formatDateDdMmYyyy = (date: string | undefined) => {
  const match = date?.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return undefined

  const [, year, month, day] = match
  return `${day}/${month}/${year}`
}

const updateOrden = (id: unknown, update: (orden: OrdenFumigacion) => OrdenFumigacion) => {
  const orden = findOrden(id)

  if (!orden) return null

  const updatedOrden = update(orden)
  ordenes = ordenes.map((currentOrden) => (
    currentOrden.id === String(id) ? updatedOrden : currentOrden
  ))

  return updatedOrden
}

const pendingFacturacionGroups = () => {
  const groups = new Map<string, { id: string, nombre: string, data: Array<Record<string, unknown>> }>()

  ordenes
    .filter((orden) => !orden.facturas?.length)
    .forEach((orden) => {
      const estanciaId = String(orden.estancia_id ?? orden.nombre_estancia ?? 'sin-estancia')
      const group = groups.get(estanciaId) ?? {
        id: estanciaId,
        nombre: orden.nombre_estancia ?? 'Sin estancia',
        data: [],
      }

      const lotes = orden.lotes?.length ? orden.lotes : [{ lote_id: orden.nombre_lote ?? orden.id, hectareas: orden.hectareas ?? 0 }]

      lotes.forEach((lote) => {
        group.data.push({
          orden_id: orden.id,
          lote_id: lote.nombre ?? lote.nombre_lote ?? lote.lote_id ?? orden.nombre_lote ?? orden.id,
          hectareas: lote.hectareas_reales ?? lote.hectareas ?? orden.hectareas ?? 0,
          fecha_trabajo_ddmmyyyy: orden.fecha_trabajo_ddmmyyyy,
          maquinista: orden.maquinista?.nombre,
          nombre_estancia: orden.nombre_estancia,
        })
      })

      groups.set(estanciaId, group)
    })

  return Array.from(groups.values())
}

export const ordenFumigacionHandlers = [
  http.get(`${API_URL}/ordenes_fumigacion`, ({ request }) => {
    const url = new URL(request.url)
    const estado = url.searchParams.get('estado')
    const estanciaId = url.searchParams.get('estancia_id')
    const cultivoId = url.searchParams.get('cultivo_id')

    const filteredOrdenes = ordenes.filter((orden) => {
      if (estado && orden.estado_orden !== estado) return false
      if (estanciaId && orden.estancia_id !== estanciaId) return false
      if (cultivoId && orden.cultivo?.id !== cultivoId) return false
      return true
    })

    return HttpResponse.json(filteredOrdenes.map(listOrden))
  }),

  http.get(`${API_URL}/ordenes_fumigacion/pendiente_factura`, () => {
    return HttpResponse.json(pendingFacturacionGroups())
  }),

  http.get(`${API_URL}/adjuntos`, ({ request }) => {
    const url = new URL(request.url)
    const ordenId = url.searchParams.get('orden_fumigacion_id')
    const orden = findOrden(ordenId)

    if (!orden) {
      return HttpResponse.json({ error: 'Orden de fumigación no encontrada' }, { status: 404 })
    }

    return HttpResponse.json(orden.adjuntos ?? [])
  }),

  http.get(`${API_URL}/ordenes_fumigacion/:id/pdf`, ({ params }) => {
    const updatedOrden = updateOrden(params.id, (orden) => ({
      ...orden,
      orden_url: `http://localhost:3000/ordenes/${orden.id}.pdf`,
      orden_pdf_fecha_creacion: '2025-01-01',
    }))

    if (!updatedOrden) {
      return HttpResponse.json({ error: 'Orden de fumigación no encontrada' }, { status: 404 })
    }

    return HttpResponse.json({
      orden_url: updatedOrden.orden_url,
      orden_pdf_fecha_creacion: updatedOrden.orden_pdf_fecha_creacion,
    })
  }),

  http.get(`${API_URL}/ordenes_fumigacion/:id`, ({ params }) => {
    const orden = findOrden(params.id)

    if (!orden) {
      return HttpResponse.json({ error: 'Orden de fumigación no encontrada' }, { status: 404 })
    }

    return HttpResponse.json(orden)
  }),

  http.post(`${API_URL}/ordenes_fumigacion`, async ({ request }) => {
    const body = await request.json() as OrdenFumigacionRequestBody
    const orden = normalizePayloadToOrden(body.orden_fumigacion)

    ordenes = [...ordenes, orden]

    return HttpResponse.json(orden, { status: 201 })
  }),

  http.patch(`${API_URL}/ordenes_fumigacion/:id/terminar`, async ({ params, request }) => {
    const body = await request.json() as OrdenFumigacionTerminarRequestBody
    const payload = body.orden_fumigacion ?? {}

    const updatedOrden = updateOrden(params.id, (orden) => ({
      ...orden,
      estado_orden: 'terminada',
      datos_clima: payload.datos_clima ?? orden.datos_clima,
      info_trabajo: payload.info_trabajo ?? orden.info_trabajo,
      fecha_trabajo: payload.fecha_trabajo ?? orden.fecha_trabajo,
      fecha_trabajo_ddmmyyyy: formatDateDdMmYyyy(payload.fecha_trabajo) ?? orden.fecha_trabajo_ddmmyyyy,
      maquinista: payload.maquinista_id
        ? { id: payload.maquinista_id, nombre: payload.maquinista_id === '1' ? 'Pedro' : 'Juan' }
        : orden.maquinista,
    }))

    if (!updatedOrden) {
      return HttpResponse.json({ error: 'Orden de fumigación no encontrada' }, { status: 404 })
    }

    return HttpResponse.json(updatedOrden)
  }),

  http.patch(`${API_URL}/ordenes_fumigacion/:id`, async ({ params, request }) => {
    const orden = findOrden(params.id)

    if (!orden) {
      return HttpResponse.json({ error: 'Orden de fumigación no encontrada' }, { status: 404 })
    }

    const body = await request.json() as OrdenFumigacionRequestBody
    const updatedOrden = normalizePayloadToOrden(body.orden_fumigacion, orden)

    ordenes = ordenes.map((currentOrden) => (
      currentOrden.id === String(params.id) ? updatedOrden : currentOrden
    ))

    return HttpResponse.json(updatedOrden)
  }),

  http.delete(`${API_URL}/ordenes_fumigacion/:id`, ({ params }) => {
    const orden = findOrden(params.id)

    if (!orden) {
      return HttpResponse.json({ error: 'Orden de fumigación no encontrada' }, { status: 404 })
    }

    ordenes = ordenes.filter((currentOrden) => currentOrden.id !== String(params.id))

    return new HttpResponse(null, { status: 204 })
  }),

  http.post(`${API_URL}/facturas`, async ({ request }) => {
    const body = await request.json() as FacturarOrdenesPayload
    const nroFactura = body.nro_factura ?? 'FAC-2026-001'

    ordenes = ordenes.map((orden) => {
      const ordenFacturada = body.ordenes_fumigacion.find((item) => String(item.id) === String(orden.id))

      if (!ordenFacturada) return orden

      return {
        ...orden,
        facturas: [
          ...(orden.facturas ?? []),
          {
            nro_factura: nroFactura,
            fecha_factura: '2026-01-10',
            nro_orden_cliente: ordenFacturada.nro_orden_cliente,
          },
        ],
      }
    })

    return HttpResponse.json({ ok: true })
  }),
]
