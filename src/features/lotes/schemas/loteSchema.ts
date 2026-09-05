import { z } from 'zod'

export const loteSchema = z.object({
  estancia_id: z.string().trim().min(1, 'La estancia es obligatoria'),
  nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
  lat: z.string().regex(/^\d+(\.\d+)?$/, "Debe ser un número válido").optional().or(z.literal('')),
  long: z.string().regex(/^\d+(\.\d+)?$/, "Debe ser un número válido").optional().or(z.literal('')),
  link_mapa: z.string().trim().optional().or(z.literal('')),
  hectareas: z
    .string()
    .trim()
    .min(1, 'Las hectareas son obligatorias')
    .regex(/^\d+(\.\d+)?$/, 'Debe ser un número válido')
    .refine((value) => Number(value) >= 0.01, 'Debe ser mayor a 0')
    .refine((value) => Number(value) <= 10000, 'Debe ser menor a 10000'),
})

export type LoteFormValues = z.infer<typeof loteSchema>
