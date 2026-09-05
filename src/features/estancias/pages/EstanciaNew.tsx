import React from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import EstanciaForm from '@/features/estancias/components/EstanciaForm'
import { useCreateEstanciaMutation } from '@/features/estancias/hooks/useEstanciaQuery'
import { toastText } from '@/lib/toast'
import type { EstanciaFormValues } from '@/features/estancias/schemas/estanciaSchema'

export default function EstanciaNew() {
  const navigate = useNavigate()
  const createMutation = useCreateEstanciaMutation()

  const handleSubmit = async (values: EstanciaFormValues) => {
    const promise = createMutation.mutateAsync(values)
    toast.promise(promise, toastText('estancia', 'create'))
    try {
      await promise
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
