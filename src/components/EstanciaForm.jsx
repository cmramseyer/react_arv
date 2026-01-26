import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import PropTypes from 'prop-types'

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function EstanciaForm({ onSubmit, estancia, actions }) {
  const form = useForm({
    defaultValues: {
      nombre: '',
      contacto: '',
      telefono: '',
      email: ''
    }
  })

  const { handleSubmit, control, reset } = form

  useEffect(() => {
    if (estancia) reset(estancia)
  }, [estancia, reset])

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

        <FormField
          control={control}
          name="contacto"
          rules={{ required: 'El contacto es requerido' }}
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
          <Button type="submit">{estancia ? 'Actualizar' : 'Crear'}</Button>
          {actions}
        </div>
      </form>
    </Form>
  )
}

EstanciaForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  estancia: PropTypes.object,
  actions: PropTypes.node,
}
