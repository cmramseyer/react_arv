import type { FacturacionResponse } from '@/features/facturacion/types'
import type { EntityId } from '@/utils/types'

export type OrdenFumigacionFilters = string | null | undefined | Record<string, string | number | boolean | null | undefined>

export type OrdenFumigacionAdjunto = {
  id?: EntityId
  attachment_id?: EntityId
  adjunto_id?: EntityId
  uuid?: string
  filename?: string
  name?: string
  nombre?: string
  url?: string
  file_url?: string
  archivo_url?: string
  path?: string
}

export type OrdenFumigacionDosis = {
  id?: EntityId
  producto_id?: EntityId
  producto?: string
  cantidad?: number | string | null
  unidad_medida?: string | null
}

export type OrdenFumigacionLote = {
  id?: EntityId
  lote_id?: EntityId
  nombre?: string
  nombre_lote?: string
  hectareas?: number | string | null
  hectareas_reales?: number | string | null
  dosis?: OrdenFumigacionDosis[]
}

export type OrdenFumigacionFactura = {
  nro_factura?: string | null
  fecha_factura?: string | null
  fecha_pago?: string | null
  nro_orden_cliente?: string | null
}

export type OrdenFumigacionListItem = {
  id: EntityId
  estancia_id: EntityId,
  nombre_estancia?: string | null
  nombre_lote?: string | null
  estado_orden?: string | null
  hectareas?: number | string | null
  hectareas_reales?: number | string | null
  temp_lotes?: string | null
  created_at_locale?: string | null
  creator?: string | null
  cultivo?: { id: EntityId; nombre: string } | null
  lotes?: OrdenFumigacionLote[]
  facturas?: OrdenFumigacionFactura[]
  maquinista?: { id: EntityId; nombre: string } | null
  fecha_trabajo_ddmmyyyy?: string | null
}

export type OrdenFumigacion = OrdenFumigacionListItem & {
  estancia_id?: EntityId
  sensible?: boolean
  comentarios?: string | null
  fecha_trabajo?: string | null
  datos_clima?: string | null
  info_trabajo?: string | null
  orden_url?: string | null
  orden_pdf_fecha_creacion?: string | null
  adjuntos?: OrdenFumigacionAdjunto[]
}

export type OrdenFumigacionPayloadDosis = {
  id: EntityId | null
  producto_id: string
  cantidad: number
}

export type OrdenFumigacionPayloadLote = {
  id: EntityId | null
  lote_id: string
  dosis: OrdenFumigacionPayloadDosis[]
  hectareas_reales?: number
}

export type OrdenFumigacionPayload = {
  orden_fumigacion: {
    id?: EntityId
    estancia_id: string
    cultivo_id?: string
    sensible: boolean
    comentarios: string
    lotes: OrdenFumigacionPayloadLote[]
  }
}

export type OrdenFumigacionTerminarPayload = {
  orden_fumigacion: {
    datos_clima?: string
    info_trabajo?: string
    fecha_trabajo?: string
    maquinista_id?: string
    [key: string]: unknown
  }
}

export type ImprimirOrdenFumigacionResponse = {
  orden_url: string
  orden_pdf_fecha_creacion?: string | null
}

export type FacturarOrdenesPayload = {
  ordenes_fumigacion: Array<{
    id: EntityId
    importe: number
    nro_orden_cliente?: string
  }>
  nro_factura?: string
}

export type FacturarOrdenesResponse = {
  ok: boolean
  [key: string]: unknown
}

export type OrdenesPendientesFacturacionResponse = FacturacionResponse
