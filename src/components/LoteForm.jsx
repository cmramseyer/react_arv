import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { useForm } from 'react-hook-form'

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import SelectField from './SelectField'

export default function LoteForm({ estancias, onSubmit, defaultValues, submitLabel }) {
  const form = useForm({
    defaultValues: defaultValues || {}
  })

  const { handleSubmit, reset, control } = form

  useEffect(() => {
    reset(defaultValues || {})
  }, [defaultValues, reset])

  const internalSubmit = async (data) => {
    const formData = new FormData()

    Object.keys(data).forEach((key) => {
      if (key === 'adjuntos') {
        const files = data.adjuntos
        if (files && files.length) {
          for (let i = 0; i < files.length; i++) {
            formData.append('lote[adjuntos][]', files[i])
          }
        }
      } else {
        // importante: en selects/inputs vacíos puede venir "" — lo mandamos igual
        formData.append(`lote[${key}]`, data[key] ?? '')
      }
    })

    await onSubmit(formData)

    // En crear suele convenir limpiar el form; en editar no necesariamente.
    // Si querés, lo controlás desde el padre. Por ahora no reseteo automáticamente.
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(internalSubmit)} className="space-y-4">
        <FormField
          control={control}
          name="estancia_id"
          rules={{ required: 'La estancia es obligatoria' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estancia</FormLabel>
              <FormControl>
                <SelectField field={field} label="Estancia" options={estancias} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="nombre"
          rules={{ required: 'El nombre es obligatorio' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del lote</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ''} type="text" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="lat"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Latitud</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ''} type="number" step="any" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="long"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Longitud</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ''} type="number" step="any" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="link_mapa"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link mapa</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ''} type="url" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="hectareas"
          rules={{
            required: 'Las hectareas son obligatorias',
            min: { value: 0.01, message: 'Debe ser mayor a 0' },
            max: { value: 10000, message: 'Debe ser menor a 10000' }
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hectareas</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ''}
                  type="number"
                  step="0.01"
                  onChange={(event) => {
                    const value = event.target.value
                    field.onChange(value === '' ? '' : Number(value))
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="adjuntos"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adjuntos</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  multiple
                  name={field.name}
                  onBlur={field.onBlur}
                  onChange={(event) => field.onChange(event.target.files)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">{submitLabel || 'Guardar'}</Button>
      </form>
    </Form>
  )
}

LoteForm.propTypes = {
  estancias: PropTypes.array.isRequired,
  onSubmit: PropTypes.func.isRequired,       // recibe FormData ya armado
  defaultValues: PropTypes.object,
  submitLabel: PropTypes.string,
}
