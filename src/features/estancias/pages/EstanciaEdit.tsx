import React, { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import EstanciaForm from '@/features/estancias/components/EstanciaForm'
import { useEstanciaQueryById, useUpdateEstanciaMutation } from '@/features/estancias/hooks/useEstanciaQuery'
import { toastText } from '@/lib/toast'
import { mapEstanciaForm } from '@/features/estancias/mappers/estanciaMappers'
import type { EstanciaFormValues } from '@/features/estancias/schemas/estanciaSchema'

export default function EstanciaEdit() {

  const { id } = useParams<{id: string}>()

  if (!id) { return <div>Error</div>}

  return <EstanciaEditForm estanciaId={id} />
}

type EstanciaEditFormProps = {
  estanciaId: string
}

function EstanciaEditForm({ estanciaId }: EstanciaEditFormProps) {
  const navigate = useNavigate()
  const estanciaQuery = useEstanciaQueryById(estanciaId)
  const updateMutation = useUpdateEstanciaMutation()

  const defaultValues = useMemo(
    () => (estanciaQuery.data ? mapEstanciaForm(estanciaQuery.data) : undefined),
    [estanciaQuery.data],
  )

  const handleSubmit = async (values: EstanciaFormValues) => {
    const promise = updateMutation.mutateAsync({ id: estanciaId, payload: values })
    toast.promise(promise, toastText('estancia', 'update'))
    try {
      await promise
      navigate('/estancias')
    } catch {
      // Sonner reports the failure to the user.
    }
  }

  if (estanciaQuery.isLoading) return <div>Cargando...</div>
  if (estanciaQuery.isError) return <div>No se encontró la estancia</div>

  return (
    <EstanciaForm
      defaultValues={defaultValues}
      isSubmitting={updateMutation.isPending}
      onCancel={() => navigate('/estancias')}
      onSubmit={handleSubmit}
      submitLabel="Actualizar"
    />
  )
}
