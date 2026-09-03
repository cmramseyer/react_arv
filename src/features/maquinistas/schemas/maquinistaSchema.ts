import { z } from 'zod'

export const maquinistaSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es requerido'),
})

export type MaquinistaFormValues = z.infer<typeof maquinistaSchema>
