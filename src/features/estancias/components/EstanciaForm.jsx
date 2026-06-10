import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useEstanciaQueryById, useMutationsEstancia } from '@/features/estancias/hooks/useEstanciaQuery'
import { estanciaSchema } from '@/features/estancias/schemas/estanciaSchema'


export default function EstanciaForm({ estanciaId = null, formAction }) {

  const navigate = useNavigate()
  const isEdit = formAction === 'edit'

  const queryEnabled = isEdit && Boolean(estanciaId)
  const estanciaQuery = useEstanciaQueryById(estanciaId, queryEnabled)


  const emptyValues = {
    nombre: '',
    contacto: '',
    telefono: '',
    email: ''
  }
  const defaultValues = isEdit ? estanciaQuery.data : emptyValues

  const form = useForm({
    resolver: zodResolver(estanciaSchema),
    defaultValues: defaultValues
  })

  const { handleSubmit, control, reset } = form

  const { createMutation, updateMutation, deleteMutation } = useMutationsEstancia()


  const isSubmitting = createMutation.isPending || updateMutation.isPending
  const isError = createMutation.isError || updateMutation.isError
  const errorMessage = createMutation.error?.message || updateMutation.error?.message || 'Error desconocido'

  const handleUpdate = async (data) => {
    try {
      await updateMutation.mutateAsync({id: estanciaId, payload: data})
      navigate('/estancias')
    } catch(error) {
      console.log(`error en el try: ${error}`)
    }
    
  }
  
  const handleCreate = async (data) => { 
    try {
      await createMutation.mutateAsync(data)
      navigate('/estancias')
    } catch(error) {
      console.log(`error en el try: ${error}`)
    }
  }

  useEffect(() => {
    if (estanciaQuery.data) reset(estanciaQuery.data)
  }, [estanciaQuery.data, reset])

  if (estanciaQuery.isLoading) return <div>Cargando...</div>
  
  if (isEdit && isError) return <div>No se encontró la estancia</div>


  return (
    <>
      <Form {...form}>
        <form noValidate onSubmit={handleSubmit(isEdit ? handleUpdate : handleCreate)} className="space-y-4">
          <FormField
            control={control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} type="text" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="contacto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contacto</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} type="text" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="telefono"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefono</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} type="tel" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} type="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" disabled={ isSubmitting }> { isEdit ? 'Actualizar' : 'Grabar' } </Button>
            { isError && errorMessage } { isSubmitting && 'Guardando...' }
          </div>
        </form>
      </Form>
      <Button type="button" variant="secondary" onClick={() => navigate('/estancias')}>
        Volver
      </Button>
    </>
  )
}
