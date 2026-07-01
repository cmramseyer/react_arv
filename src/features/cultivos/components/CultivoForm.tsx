import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCultivoQuery, useCultivoMutation } from '@/features/cultivos/hooks/useCultivoQuery'
import { useNavigate } from 'react-router-dom'

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cultivoSchema } from '@/features/cultivos/schemas/cultivoSchema'
import type { CultivoFormValues } from '@/features/cultivos/schemas/cultivoSchema'

type CultivoFormEditProps = {
  formAction: 'edit',
  id: number | string
}

type CultivoFormCreateProps = {
  formAction: 'create',
  id?: never
}

type CultivoFormProps = CultivoFormEditProps | CultivoFormCreateProps

export default function CultivoForm({ formAction, id }: CultivoFormProps) {
  const navigate = useNavigate()
  const isEdit = formAction === 'edit'
  
  const form = useForm<CultivoFormValues>({
    resolver: zodResolver(cultivoSchema),
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

  const handleCreate = async (data: CultivoFormValues) => {
    try {
      await createMutation.mutateAsync(data)
      navigate('/cultivos')
    } catch {}
  }

  const handleUpdate = async (data: CultivoFormValues) => {
    try {
      await updateMutation.mutateAsync({id, payload: data})
      navigate('/cultivos')
    } catch {}
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
