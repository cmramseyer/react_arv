import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMaquinistaQuery, useMaquinistaMutation } from '@/features/maquinistas/hooks/useMaquinistaQuery'
import { useNavigate } from 'react-router-dom'

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { maquinistaSchema } from '@/features/maquinistas/schemas/maquinistaSchema'

export default function MaquinistaForm({ formAction, id }) {

  console.log(id)

  const navigate = useNavigate()
  const isEdit = formAction === 'edit'

  const form = useForm({
    resolver: zodResolver(maquinistaSchema),
    defaultValues: {
      nombre: '',
    }
  })

  const { handleSubmit, control, reset } = form

  const enabled = isEdit
  const maquinistaQuery = useMaquinistaQuery(id, enabled)
  const { createMutation, updateMutation } = useMaquinistaMutation()

  useEffect(() => {
    reset(maquinistaQuery.data)
  }, [maquinistaQuery.data, reset])

  const handleCreate = async (data) => {
    try {
      await createMutation.mutateAsync(data)
      navigate('/maquinistas')
    } catch (error) {
      console.log('error create')
    }
  }
  
  const handleUpdate = async (data) => {
    try {
      await updateMutation.mutateAsync({id, data})
      navigate('/maquinistas')
    } catch (error) {
      console.log('error create')
    }
  }

  return (
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

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit">{isEdit ? 'Actualizar' : 'Grabar'}</Button>
        </div>
      </form>
    </Form>
  )
}
