import React, { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import MaquinistaForm from '@/features/maquinistas/components/MaquinistaForm'
import { useMaquinistaQuery, useUpdateMaquinistaMutation } from '@/features/maquinistas/hooks/useMaquinistaQuery'
import { toastText } from '@/lib/toast'
import type { MaquinistaFormValues } from '@/features/maquinistas/schemas/maquinistaSchema'

export default function MaquinistaEdit() {

  const { id } = useParams<{id: string}>()
  if (!id) {
    return <div>ID inválido</div>
  }
  return (
    <div>
      <h2>Editar Maquinista</h2>

      <MaquinistaEditForm maquinistaId={id} />
    </div>
  )
}

type MaquinistaEditFormProps = {
  maquinistaId: string
}

function MaquinistaEditForm({ maquinistaId }: MaquinistaEditFormProps) {
  const navigate = useNavigate()
  const maquinistaQuery = useMaquinistaQuery(maquinistaId)
  const updateMutation = useUpdateMaquinistaMutation()

  const defaultValues = useMemo(
    () => (maquinistaQuery.data ? { nombre: maquinistaQuery.data.nombre } : undefined),
    [maquinistaQuery.data],
  )

  const handleSubmit = async (values: MaquinistaFormValues) => {
    const promise = updateMutation.mutateAsync({ id: maquinistaId, payload: values })
    toast.promise(promise, toastText('maquinista', 'update'))
    try {
      await promise
      navigate('/maquinistas')
    } catch {
      // Sonner reports the failure to the user.
    }
  }

  if (maquinistaQuery.isLoading) { return <div>Cargando...</div> }
  if (maquinistaQuery.isError) { return <div>No se encontró el maquinista</div> }

  return (
    <MaquinistaForm
      defaultValues={defaultValues}
      isSubmitting={updateMutation.isPending}
      onSubmit={handleSubmit}
      submitLabel="Actualizar"
    />
  )
}
