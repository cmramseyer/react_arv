import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMaquinistaQuery, useMaquinistaMutation } from '@/features/maquinistas/hooks/useMaquinistaQuery'
import { useNavigate } from 'react-router-dom'

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { maquinistaSchema } from '@/features/maquinistas/schemas/maquinistaSchema'
import type { MaquinistaFormValues } from '@/features/maquinistas/schemas/maquinistaSchema'
import type { EntityId } from '@/utils/types'

type MaquinistaEditFormProps = {
  formAction: 'edit',
  id: EntityId
}

type MaquinistaCreateFormProps = {
  formAction: 'create',
  id?: never
}

type MaquinistaFormProps = MaquinistaEditFormProps | MaquinistaCreateFormProps

export default function MaquinistaForm(props: MaquinistaFormProps) {

  const navigate = useNavigate()
  const isEdit = props.formAction === 'edit'

  const form = useForm<MaquinistaFormValues>({
    resolver: zodResolver(maquinistaSchema),
    defaultValues: {
      nombre: '',
    }
  })

  const { handleSubmit, control, reset } = form

  const enabled = isEdit
  const maquinistaQuery = useMaquinistaQuery(isEdit ? props.id : null, enabled)
  const { createMutation, updateMutation } = useMaquinistaMutation()

  useEffect(() => {
    if(maquinistaQuery.data) reset(maquinistaQuery.data)
  }, [maquinistaQuery.data, reset])

  const handleCreate = async (data: MaquinistaFormValues) => {
    try {
      await createMutation.mutateAsync(data)
      navigate('/maquinistas')
    } catch (error) {
      console.log(`error create: ${error.message}`)
    }
  }
  
  const handleUpdate = async (data: MaquinistaFormValues) => {
    if (!isEdit) return
    try {
      await updateMutation.mutateAsync({id: props.id, payload: data})
      navigate('/maquinistas')
    } catch (error) {
      console.log(`error update: ${error.message}`)
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
