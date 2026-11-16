import { z } from 'zod'
import { isValidEstanciaPhone } from '@/features/estancias/utils/phone'

export const estanciaSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es requerido'),
  contacto: z.string().trim().optional(),
  telefono: z
    .string()
    .refine((value) => isValidEstanciaPhone(value), 'El telefono debe tener 10 digitos')
    .optional(),
  email: z
    .string()
    .trim()
    .email('El email no es valido')
    .optional()
    .or(z.literal('')),
})

export type EstanciaFormValues = z.infer<typeof estanciaSchema>