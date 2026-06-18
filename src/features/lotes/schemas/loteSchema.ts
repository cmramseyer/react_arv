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

export const loteSchema = z.object({
  estancia_id: z.string().trim().min(1, 'La estancia es obligatoria'),
  nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
  lat: optionalNumber('La latitud debe ser un numero'),
  long: optionalNumber('La longitud debe ser un numero'),
  link_mapa: z.string().trim().optional().or(z.literal('')),
  hectareas: z.preprocess((value) => {
    const normalizedValue = optionalValue(value)
    if (normalizedValue === undefined) return undefined
    return Number(normalizedValue)
  }, z.number({
    invalid_type_error: 'Las hectareas son obligatorias',
    required_error: 'Las hectareas son obligatorias',
  }).min(0.01, 'Debe ser mayor a 0').max(10000, 'Debe ser menor a 10000')),
  adjuntos: z.any().optional(),
})

export type LoteFormValues = z.infer<typeof loteSchema>
