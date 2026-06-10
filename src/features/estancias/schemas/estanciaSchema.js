import { z } from 'zod'

export const estanciaSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es requerido'),
  contacto: z.string().trim().optional(),
  telefono: z
    .string()
    .trim()
    .regex(/^\d+$/, 'El telefono debe ser numerico')
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .trim()
    .email('El email no es valido')
    .optional()
    .or(z.literal('')),
})
