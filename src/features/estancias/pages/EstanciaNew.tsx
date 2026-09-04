import React from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import EstanciaForm from '@/features/estancias/components/EstanciaForm'
import { useCreateEstanciaMutation } from '@/features/estancias/hooks/useEstanciaQuery'
import type { EstanciaFormValues } from '@/features/estancias/schemas/estanciaSchema'

export default function EstanciaNew() {
  const navigate = useNavigate()
  const createMutation = useCreateEstanciaMutation()

  const handleSubmit = async (values: EstanciaFormValues) => {
    try {
      await toast.promise(createMutation.mutateAsync(values), {
        loading: 'Guardando estancia...',
        success: 'Estancia creada',
        error: 'Hubo un error',
      })
      navigate('/estancias')
    } catch {
      // Sonner reports the failure to the user.
    }
  }

  return (
    <EstanciaForm
      isSubmitting={createMutation.isPending}
      onCancel={() => navigate('/estancias')}
      onSubmit={handleSubmit}
      submitLabel="Grabar"
    />
  )
}
