import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { useForm } from 'react-hook-form'

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const unidadMedidaOptions = [
  { value: 'kg', label: 'Kilogramos' },
  { value: 'gramos', label: 'Gramos' },
  { value: 'litros', label: 'Litros' },
  { value: 'ml', label: 'Mililitros' }
]

export default function ProductoForm({ onSubmit, defaultValues, submitLabel, actions }) {
  const form = useForm({
    defaultValues: defaultValues || {}
  })

  const { control, handleSubmit, reset } = form

  useEffect(() => {
    reset(defaultValues || {})
  }, [defaultValues, reset])

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={control}
          name="nombre"
          rules={{ required: 'El nombre es obligatorio' }}
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
          name="tipo_producto"
          rules={{ required: 'El tipo de producto es obligatorio' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de producto</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ''} type="text" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="unidad_medida"
          rules={{ required: 'La unidad de medida es obligatoria' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unidad de medida</FormLabel>
              <FormControl>
                <Select value={field.value ?? ''} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {unidadMedidaOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit">{submitLabel || 'Guardar'}</Button>
          {actions}
        </div>
      </form>
    </Form>
  )
}

ProductoForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,     // (data) => Promise<void>
  defaultValues: PropTypes.object,
  submitLabel: PropTypes.string,
  actions: PropTypes.node,
}
