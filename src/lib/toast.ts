export type ToastEntity =
  | 'estancia'
  | 'lote'
  | 'producto'
  | 'cultivo'
  | 'maquinista'
  | 'orden_fumigacion'
  | 'factura'

export type ToastAction = 'create' | 'update' | 'delete' | 'upload' | 'remove' | 'finish' | 'pay'

export type ToastMessages = {
  loading: string
  success: string
  error: string
}

const GENERIC_ERROR = 'Hubo un error'

type EntityCopy = {
  label: string
  feminine: boolean
}

const ENTITY_COPY: Record<ToastEntity, EntityCopy> = {
  estancia: { label: 'estancia', feminine: true },
  lote: { label: 'lote', feminine: false },
  producto: { label: 'producto', feminine: false },
  cultivo: { label: 'cultivo', feminine: false },
  maquinista: { label: 'maquinista', feminine: false },
  orden_fumigacion: { label: 'orden de fumigación', feminine: true },
  factura: { label: 'factura', feminine: true },
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function toastText(entity: ToastEntity, action: ToastAction): ToastMessages {
  const copy = ENTITY_COPY[entity]
  const ending = copy.feminine ? 'a' : 'o'

  switch (action) {
    case 'create':
      return {
        loading: `Guardando ${copy.label}...`,
        success: `${capitalize(copy.label)} cread${ending}`,
        error: GENERIC_ERROR,
      }
    case 'update':
      return {
        loading: `Actualizando ${copy.label}...`,
        success: `${capitalize(copy.label)} actualizad${ending}`,
        error: GENERIC_ERROR,
      }
    case 'delete':
      return {
        loading: `Eliminando ${copy.label}...`,
        success: `${capitalize(copy.label)} eliminad${ending}`,
        error: GENERIC_ERROR,
      }
    case 'upload':
      return {
        loading: 'Subiendo adjunto...',
        success: 'Adjunto subido',
        error: GENERIC_ERROR,
      }
    case 'remove':
      return {
        loading: 'Eliminando adjunto...',
        success: 'Adjunto eliminado',
        error: GENERIC_ERROR,
      }
    case 'finish':
      return {
        loading: 'Terminando orden de fumigación...',
        success: 'Orden de fumigación terminada',
        error: GENERIC_ERROR,
      }
    case 'pay':
      return {
        loading: 'Marcando factura como pagada...',
        success: 'Factura marcada como pagada',
        error: GENERIC_ERROR,
      }
  }
}
