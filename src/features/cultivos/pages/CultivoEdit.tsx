import React, { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import CultivoForm from '@/features/cultivos/components/CultivoForm'
import { useCultivoQuery, useUpdateCultivoMutation } from '@/features/cultivos/hooks/useCultivoQuery'
import { toastText } from '@/lib/toast'
import type { CultivoFormValues } from '@/features/cultivos/schemas/cultivoSchema'

export default function CultivoEdit() {
  const { id } = useParams()

  if(!id) { return <div>Error</div> }

  return (
    <div>
      <h2>Editar Cultivo</h2>
      <CultivoEditForm cultivoId={id} />
    </div>
  )
}

type CultivoEditFormProps = {
  cultivoId: string
}

function CultivoEditForm({ cultivoId }: CultivoEditFormProps) {
  const navigate = useNavigate()
  const cultivoQuery = useCultivoQuery(cultivoId)
  const updateMutation = useUpdateCultivoMutation()

  const defaultValues = useMemo(
    () => (cultivoQuery.data ? { nombre: cultivoQuery.data.nombre } : undefined),
    [cultivoQuery.data],
  )

  const handleSubmit = async (values: CultivoFormValues) => {
    const promise = updateMutation.mutateAsync({ id: cultivoId, payload: values })
    toast.promise(promise, toastText('cultivo', 'update'))
    try {
      await promise
      navigate('/cultivos')
    } catch {
      // Sonner reports the failure to the user.
    }
  }

  if (cultivoQuery.isLoading) { return <div>Cargando...</div> }
  if (cultivoQuery.isError) { return <div>No se encontró el cultivo</div> }

  return (
    <CultivoForm
      defaultValues={defaultValues}
      isSubmitting={updateMutation.isPending}
      onSubmit={handleSubmit}
      submitLabel="Actualizar"
    />
  )
}
