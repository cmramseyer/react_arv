import type { OrdenFumigacionFormValues } from '@/features/ordenes-fumigacion/schemas/ordenFumigacionSchema'
import type { OrdenFumigacion } from '@/features/ordenes-fumigacion/types'

export const ordenToForm = (data: OrdenFumigacion): OrdenFumigacionFormValues => {
  console.log("ordenToForm", data.cultivo)
  const normalizeNumber = (value: number | string | null | undefined) => {
    if (value === null || value === undefined || value === '') return undefined
    return Number(value)
  }

  return { 
    id: String(data.id) ?? '',
    estancia_id: String(data.estancia_id) ?? '',
    cultivo_id: data.cultivo?.id ? String(data.cultivo.id) : '',
    sensible: data.sensible ?? false,
    comentarios: data.comentarios ?? '',
    datos_clima: data.datos_clima ?? '',
    info_trabajo: data.info_trabajo ?? '',
    creator: data.creator ?? '',
    fecha_trabajo: data.fecha_trabajo ?? '',
    maquinista_id: data.maquinista?.id ? String(data.maquinista.id) : '',
    lotes: (data.lotes || []).map((e) => {
      return {
        orden_lote_id: e.id,
        lote_id: e.lote_id ? String(e.lote_id) : '',
        hectareas_reales: normalizeNumber(e.hectareas_reales),
        dosis: (e.dosis || []).map((d) => { 
          return {
            orden_lote_dosis_id: d.id,
            producto_id: d.producto_id ? String(d.producto_id) : '',
            cantidad: Number(d.cantidad),
          }
        })
      }
    })

  }
}
