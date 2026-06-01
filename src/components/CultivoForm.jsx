import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useCultivoQuery, useCultivoMutation } from '@/hooks/useCultivoQuery'
import { useNavigate } from 'react-router-dom'

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function CultivoForm({ formAction, id }) {
  const navigate = useNavigate()
  const isEdit = formAction === 'edit'
  
  const form = useForm({
    defaultValues: {
      nombre: '',
    }
  })

  const { handleSubmit, control, reset } = form

  const enabled = isEdit
  console.log(`isEdit: ${isEdit}, id: ${id}`)
  const cultivoQuery = useCultivoQuery(id, enabled)
  const { createMutation, updateMutation } = useCultivoMutation()

  useEffect(() => {
    reset(cultivoQuery.data)
  }, [cultivoQuery.data, reset])

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync(form.getValues())
      navigate('/cultivos')
    } catch {}
  }

  const handleUpdate = async () => {
    try {
      await updateMutation.mutateAsync({id, data: form.getValues()})
      navigate('/cultivos')
    } catch {}
  }

  return (
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

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit">{isEdit ? 'Actualizar' : 'Grabar'}</Button>
        </div>
      </form>
    </Form>
  )
}

