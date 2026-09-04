import { describe, expect, it } from 'vitest'

import { toastText } from '@/lib/toast'

describe('toastText', () => {
  it('keeps the Estancia create/update/delete copy unchanged', () => {
    expect(toastText('estancia', 'create')).toEqual({
      loading: 'Guardando estancia...',
      success: 'Estancia creada',
      error: 'Hubo un error',
    })
    expect(toastText('estancia', 'update')).toEqual({
      loading: 'Actualizando estancia...',
      success: 'Estancia actualizada',
      error: 'Hubo un error',
    })
    expect(toastText('estancia', 'delete')).toEqual({
      loading: 'Eliminando estancia...',
      success: 'Estancia eliminada',
      error: 'Hubo un error',
    })
  })

  it('uses masculine endings for Lote', () => {
    expect(toastText('lote', 'create').success).toBe('Lote creado')
    expect(toastText('lote', 'delete').success).toBe('Lote eliminado')
  })

  it('uses feminine endings for Orden de fumigación', () => {
    expect(toastText('orden_fumigacion', 'update')).toEqual({
      loading: 'Actualizando orden de fumigación...',
      success: 'Orden de fumigación actualizada',
      error: 'Hubo un error',
    })
  })

  it('covers adjunto upload and remove copy', () => {
    expect(toastText('lote', 'upload')).toEqual({
      loading: 'Subiendo adjunto...',
      success: 'Adjunto subido',
      error: 'Hubo un error',
    })
    expect(toastText('lote', 'remove')).toEqual({
      loading: 'Eliminando adjunto...',
      success: 'Adjunto eliminado',
      error: 'Hubo un error',
    })
  })
})
