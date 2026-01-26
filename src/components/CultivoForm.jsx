import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import PropTypes from 'prop-types'

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function CultivoForm({ onSubmit, cultivo, actions }) {
  const form = useForm({
    defaultValues: {
      nombre: '',
    }
  })

  const { handleSubmit, control, reset } = form

  useEffect(() => {
    if (cultivo) reset(cultivo)
  }, [cultivo, reset])

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          <Button type="submit">{cultivo ? 'Actualizar' : 'Crear'}</Button>
          {actions}
        </div>
      </form>
    </Form>
  )
}

CultivoForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  cultivo: PropTypes.object,
  actions: PropTypes.node,
}
