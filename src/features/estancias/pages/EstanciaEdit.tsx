import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import EstanciaForm from '@/features/estancias/components/EstanciaForm'
import { useEstanciaQueryById, useUpdateEstanciaMutation } from '@/features/estancias/hooks/useEstanciaQuery'
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

  const handleSubmit = async (values: EstanciaFormValues) => {
    try {
      await updateMutation.mutateAsync({ id: estanciaId, payload: values })
      navigate('/estancias')
    } catch {
      // The mutation error is rendered by the form.
    }
  }

  if (estanciaQuery.isLoading) return <div>Cargando...</div>
  if (estanciaQuery.isError) return <div>No se encontró la estancia</div>

  return (
    <EstanciaForm
      defaultValues={estanciaQuery.data ? mapEstanciaForm(estanciaQuery.data) : undefined}
      isSubmitting={updateMutation.isPending}
      onCancel={() => navigate('/estancias')}
      onSubmit={handleSubmit}
      submitError={updateMutation.error?.message}
      submitLabel="Actualizar"
    />
  )
}
