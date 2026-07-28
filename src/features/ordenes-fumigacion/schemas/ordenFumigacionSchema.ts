import { z } from 'zod'

const optionalValue = (value: unknown) => {
  if (value === '' || value === null || value === undefined) return undefined
  return value
}

const optionalNumber = (message: string) =>
  z.preprocess(
    optionalValue,
    z.coerce.number({ invalid_type_error: message }).optional()
  )

const dosisSchema = z.object({
  orden_lote_dosis_id: z.any().optional(),
  producto_id: z.string().trim(),
  cantidad: optionalNumber('La cantidad debe ser un numero'),
}).superRefine((dosis, context) => {
  const hasProducto = Boolean(dosis.producto_id)
  const hasCantidad = dosis.cantidad !== undefined

  if (!hasProducto && !hasCantidad) return

  if (!hasProducto) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['producto_id'], message: 'El producto es obligatorio' })
  }

  if (!hasCantidad || Number(dosis.cantidad) <= 0) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['cantidad'], message: 'La cantidad debe ser mayor a 0' })
  }
})

const loteOrdenSchema = z.object({
  orden_lote_id: z.any().optional(),
  lote_id: z.string().trim().optional(),
  nombre_manual: z.string().trim().optional(),
  es_manual: z.boolean().optional(),
  hectareas_reales: optionalNumber('Las hectareas reales deben ser un numero'),
  dosis: z.array(dosisSchema),
  eliminado: z.boolean().optional(),
}).superRefine((lote, context) => {
  if (lote.eliminado) return

  const hasLoteExistente = Boolean(lote.lote_id)
  const hasNombreManual = Boolean(lote.nombre_manual)

  if (hasLoteExistente && hasNombreManual) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['nombre_manual'], message: 'Seleccione un lote o ingrese un lote manual, no ambos' })
    return
  }

  if (hasLoteExistente && !lote.es_manual) return

  if (!hasNombreManual) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: [lote.es_manual ? 'nombre_manual' : 'lote_id'],
      message: lote.es_manual ? 'El nombre del lote es obligatorio' : 'El lote es obligatorio',
    })
    return
  }

  if (lote.hectareas_reales === undefined || Number(lote.hectareas_reales) <= 0) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['hectareas_reales'], message: 'Debe ser mayor a 0' })
  }
})

export const ordenFumigacionSchema = z.object({
  id: z.any().optional(),
  estancia_id: z.string().trim().min(1, 'La estancia es obligatoria'),
  cultivo_id: z.string().trim().optional().or(z.literal('')),
  sensible: z.boolean().default(false),
  comentarios: z.string().trim().optional().or(z.literal('')),
  lotes: z.array(loteOrdenSchema).min(1, 'Debe agregar al menos un lote').refine(
    (lotes) => lotes.some((lote) => !lote.eliminado),
    'Debe agregar al menos un lote',
  ),
  datos_clima: z.string().trim().optional().or(z.literal('')),
  info_trabajo: z.string().trim().optional().or(z.literal('')),
  fecha_trabajo: z.string().trim().optional().or(z.literal('')),
  maquinista_id: z.string().trim().optional().or(z.literal('')),
  creator: z.string().optional(),
})

export type OrdenFumigacionFormValues = {
  id?: string
  estancia_id: string
  cultivo_id?: string
  sensible: boolean
  comentarios?: string
  lotes: Array<{
    orden_lote_id?: number | string
    lote_id?: string
    nombre_manual?: string
    es_manual?: boolean
    hectareas_reales?: number | string
    eliminado?: boolean
    dosis: Array<{
      orden_lote_dosis_id?: number | string
      producto_id: string
      cantidad: number | string
    }>
  }>
  datos_clima?: string
  info_trabajo?: string
  fecha_trabajo?: string
  maquinista_id?: string
  creator?: string
}
