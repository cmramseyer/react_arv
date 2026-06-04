import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useEstanciaQueryById, useMutationsEstancia } from '@/features/estancias/hooks/useEstanciaQuery'


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
    defaultValues: defaultValues
  })

  const { handleSubmit, control, reset } = form

  const { createMutation, updateMutation, deleteMutation } = useMutationsEstancia()


  const isSubmitting = createMutation.isPending || updateMutation.isPending
  const isError = createMutation.isError || updateMutation.isError
  const errorMessage = createMutation.error?.message || updateMutation.error?.message || 'Error desconocido'

  const handleUpdate = async () => {
    try {
      await updateMutation.mutateAsync({id: estanciaId, payload: form.getValues()})
      navigate('/estancias')
    } catch(error) {
      console.log(`error en el try: ${error}`)
    }
    
  }
  
  const handleCreate = async () => { 
    try {
      await createMutation.mutateAsync(form.getValues())
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
        <form onSubmit={handleSubmit(isEdit ? handleUpdate : handleCreate)} className="space-y-4">
          <FormField
            control={control}
            name="nombre"
            rules={{ required: 'El nombre es requerido' }}
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
            rules={{ required: 'El contacto es requerido',
              validate: (value) =>
                String(value ?? '').trim().length > 0 || 'El nombre es requerido',
             }}
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
            rules={{ required: 'El telefono es requerido' }}
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
            rules={{
              required: 'El email es requerido',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'El email no es valido'
              }
            }}
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
