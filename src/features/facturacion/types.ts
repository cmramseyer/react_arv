export type FacturacionOrdenPendiente = {
  orden_id: number | string
  lote_id: number | string
  hectareas: number | string
  fecha_trabajo_ddmmyyyy?: string | null
  maquinista?: string | null
  nombre_estancia?: string | null
}

export type FacturacionGrupoPendiente = {
  id?: number | string
  nombre?: string
  data: FacturacionOrdenPendiente[]
}

export type FacturaPagoOrden = {
  id?: number | string
  orden_id?: number | string
  lote_id?: number | string
  hectareas?: number | string
  fecha_trabajo_ddmmyyyy?: string | null
  maquinista?: string | null
  nombre_estancia?: string | null
  importe?: number | string | null
  nro_orden_cliente?: string | null
  lotes?: Record<string, unknown>[]
}

export type FacturaPago = {
  id: number | string
  fecha_factura_ddmmyyyy?: string | null
  nro_factura?: string | null
  ordenes_fumigacion: FacturaPagoOrden[]
}

export type FacturacionResponse = FacturaPago[] | FacturacionGrupoPendiente[] | {
  data?: FacturaPago[] | FacturacionGrupoPendiente[] | {
    data?: FacturaPago[] | FacturacionGrupoPendiente[]
  }
}
