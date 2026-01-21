import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import PropTypes from 'prop-types'

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function MaquinistaForm({ onSubmit, maquinista }) {
  const form = useForm({
    defaultValues: {
      nombre: '',
    }
  })

  const { handleSubmit, control, reset } = form

  useEffect(() => {
    if (maquinista) reset(maquinista)
  }, [maquinista, reset])

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

        <Button type="submit">{maquinista ? 'Actualizar' : 'Crear'}</Button>
      </form>
    </Form>
  )
}

MaquinistaForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  maquinista: PropTypes.object,
}