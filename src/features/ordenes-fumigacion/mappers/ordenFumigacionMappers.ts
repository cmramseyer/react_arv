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
        .map((lote) => {
          if (lote.eliminado && lote.orden_lote_id) {
            return { id: lote.orden_lote_id, _destroy: true as const }
          }

          const dosis = (lote.dosis || [])
            .filter((dosis) => dosis.producto_id && dosis.cantidad !== null && dosis.cantidad !== undefined && dosis.cantidad !== '')
            .map((dosis) => ({
              ...(dosis.orden_lote_dosis_id ? { id: dosis.orden_lote_dosis_id } : {}),
              producto_id: dosis.producto_id,
              cantidad: Number(dosis.cantidad),
            }))
          const id = lote.orden_lote_id ? { id: lote.orden_lote_id } : {}

          if (!lote.es_manual && lote.lote_id) {
            const loteData = {
              ...id,
              lote_id: lote.lote_id,
              dosis,
            }

            if (lote.hectareas_reales !== null && lote.hectareas_reales !== undefined && lote.hectareas_reales !== '') {
              return {
                ...loteData,
                hectareas_reales: Number(lote.hectareas_reales),
              }
            }

            return loteData
          }

          return {
            ...id,
            nombre_manual: lote.nombre_manual ?? '',
            hectareas_reales: Number(lote.hectareas_reales),
            dosis,
          }
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
