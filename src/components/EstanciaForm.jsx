import { React } from 'react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import PropTypes from 'prop-types'

import { Form , FormDescription, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Button } from './ui/button'
import { Input } from './ui/input'

export default function EstanciaForm({ onSubmit, estancia }) {
  const form =  useForm({
    defaultValues: {
      nombre: '',
      contacto: '',
      telefono: '',
      email: ''
    }
  })

  const { register, handleSubmit, control, reset, formState: { errors } } = form

  useEffect(() => {
    if (estancia) reset(estancia)
  }, [estancia, reset])

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormField
          control={control}
          name="nombre"
          render={(field) => (
            <FormItem>
              <FormLabel />
              <FormControl>
                <Input {...register('nombre', { required: 'El nombre es requerido' })} type="text" placeholder="Nombre" />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="contacto"
          render={(field) => (
            <FormItem>
              <FormLabel />
              <FormControl>
                <Input {...register('contacto', { required: 'El contacto es requerido' })} type="text" placeholder="Contacto" />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          )}
        />
          
        <FormField
          control={control}
          name="telefono"
          render={(field) => (
            <FormItem>
              <FormLabel />
              <FormControl>
                <Input {...register('telefono', { required: 'El telefono es requerido' })} type="text" placeholder="Teléfono" />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="email"
          render={(field) => (
            <FormItem>
              <FormLabel />
              <FormControl>
                <Input {...register('email', { 
                  required: 'El email es requerido',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'El email no es válido'
                  } })} type="email" placeholder="email@empresa.com" />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">{estancia ? 'Actualizar' : 'Crear'}</Button>
      </form>
    </Form>
  )
}

EstanciaForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  estancia: PropTypes.array.isRequired,
}