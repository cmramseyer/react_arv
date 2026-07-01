import type { OrdenFumigacionFormValues } from '@/features/ordenes-fumigacion/schemas/ordenFumigacionSchema'
import type { OrdenFumigacionPayload } from '@/features/ordenes-fumigacion/types'

export const mapOrdenFumigacionFormValuesToPayload = (
  values: OrdenFumigacionFormValues,
): OrdenFumigacionPayload => {
  const payload: OrdenFumigacionPayload = {
    orden_fumigacion: {
      estancia_id: values.estancia_id,
      sensible: values.sensible ?? false,
      comentarios: values.comentarios ?? '',
      lotes: (values.lotes || [])
        .filter((lote) => lote.lote_id)
        .map((lote) => {
          const loteData = {
            id: lote?.orden_lote_id || null,
            lote_id: lote.lote_id,
            dosis: (lote.dosis || [])
              .filter((dosis) => dosis.producto_id && dosis.cantidad !== null)
              .map((dosis) => ({
                id: dosis.orden_lote_dosis_id || null,
                producto_id: dosis.producto_id,
                cantidad: dosis.cantidad,
              })),
          }

          if (lote.hectareas_reales !== null && lote.hectareas_reales !== undefined) {
            return {
              ...loteData,
              hectareas_reales: lote.hectareas_reales,
            }
          }

          return loteData
        }),
    },
  }

  if (values.cultivo_id) {
    payload.orden_fumigacion.cultivo_id = values.cultivo_id
  }

  if (values.id) {
    payload.orden_fumigacion.id = values.id
  }

  return payload
}
