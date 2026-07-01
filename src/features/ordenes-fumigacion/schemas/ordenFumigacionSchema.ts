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

const requiredPositiveNumber = (message: string) =>
  z.preprocess((value) => {
    const normalizedValue = optionalValue(value)
    if (normalizedValue === undefined) return undefined
    return Number(normalizedValue)
  }, z.number({
    invalid_type_error: message,
    required_error: message,
  }).min(0.01, 'Debe ser mayor a 0'))

const dosisSchema = z.object({
  orden_lote_dosis_id: z.any().optional(),
  producto_id: z.string().trim().min(1, 'El producto es obligatorio'),
  cantidad: requiredPositiveNumber('La cantidad es obligatoria'),
})

const loteOrdenSchema = z.object({
  orden_lote_id: z.any().optional(),
  lote_id: z.string().trim().min(1, 'El lote es obligatorio'),
  hectareas_reales: optionalNumber('Las hectareas reales deben ser un numero'),
  dosis: z.array(dosisSchema).min(1, 'Debe agregar al menos una dosis'),
})

export const ordenFumigacionSchema = z.object({
  id: z.any().optional(),
  estancia_id: z.string().trim().min(1, 'La estancia es obligatoria'),
  cultivo_id: z.string().trim().optional().or(z.literal('')),
  sensible: z.boolean().default(false),
  comentarios: z.string().trim().optional().or(z.literal('')),
  lotes: z.array(loteOrdenSchema).min(1, 'Debe agregar al menos un lote'),
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
    lote_id: string
    hectareas_reales?: number | string
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
