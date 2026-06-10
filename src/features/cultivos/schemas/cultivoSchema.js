import { z } from 'zod'

export const cultivoSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es requerido'),
})
