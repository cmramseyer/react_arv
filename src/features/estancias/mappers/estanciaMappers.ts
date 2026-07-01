import type { Estancia } from '@/features/estancias/types'

export function mapEstanciaForm(estancia: Estancia) {
  return {
    id: estancia.id,
    nombre: estancia.nombre,
    contacto: estancia.contacto ?? '',
    telefono: estancia.telefono ?? '',
    email: estancia.email ?? ''
  }
}