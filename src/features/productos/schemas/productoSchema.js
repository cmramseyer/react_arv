import { z } from 'zod'

export const productoSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio'),
  tipo_producto: z.string().trim().min(1, 'El tipo de producto es obligatorio'),
  unidad_medida: z.string().trim().min(1, 'La unidad de medida es obligatoria'),
})
