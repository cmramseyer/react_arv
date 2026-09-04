import React from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import MaquinistaForm from '@/features/maquinistas/components/MaquinistaForm'
import { useCreateMaquinistaMutation } from '@/features/maquinistas/hooks/useMaquinistaQuery'
import { toastText } from '@/lib/toast'
import type { MaquinistaFormValues } from '@/features/maquinistas/schemas/maquinistaSchema'

export default function MaquinistaNew() {
  const navigate = useNavigate()
  const createMutation = useCreateMaquinistaMutation()

  const handleSubmit = async (values: MaquinistaFormValues) => {
    const promise = createMutation.mutateAsync(values)
    toast.promise(promise, toastText('maquinista', 'create'))
    try {
      await promise
      navigate('/maquinistas')
    } catch {
      // Sonner reports the failure to the user.
    }
  }

  return (
    <div>
      <h2>Nuevo Maquinista</h2>

      <MaquinistaForm
        isSubmitting={createMutation.isPending}
        onSubmit={handleSubmit}
        submitLabel="Grabar"
      />
    </div>
  )
}
