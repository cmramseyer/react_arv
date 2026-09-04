import React from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import CultivoForm from '@/features/cultivos/components/CultivoForm'
import { useCreateCultivoMutation } from '@/features/cultivos/hooks/useCultivoQuery'
import { toastText } from '@/lib/toast'
import type { CultivoFormValues } from '@/features/cultivos/schemas/cultivoSchema'

export default function CultivoNew() {
  const navigate = useNavigate()
  const createMutation = useCreateCultivoMutation()

  const handleSubmit = async (values: CultivoFormValues) => {
    const promise = createMutation.mutateAsync(values)
    toast.promise(promise, toastText('cultivo', 'create'))
    try {
      await promise
      navigate('/cultivos')
    } catch {
      // Sonner reports the failure to the user.
    }
  }

  return (
    <div>
      <h2>Nuevo Cultivo</h2>
      <CultivoForm
        isSubmitting={createMutation.isPending}
        onSubmit={handleSubmit}
        submitLabel="Grabar"
      />
    </div>
  )
}
