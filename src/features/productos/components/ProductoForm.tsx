import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { AsyncButton } from '@/components/ui/async-button'
import { productoSchema } from '@/features/productos/schemas/productoSchema'
import type { ProductoFormValues } from '@/features/productos/schemas/productoSchema'
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

type ProductoFormProps = {
  defaultValues?: ProductoFormValues
  isSubmitting: boolean
  onSubmit: (values: ProductoFormValues) => Promise<void>
  submitLabel: string
}

export default function ProductoForm({ defaultValues, isSubmitting, onSubmit, submitLabel }: ProductoFormProps) {
  const form = useForm<ProductoFormValues>({
    resolver: zodResolver(productoSchema),
    defaultValues: {
      nombre: '',
      tipo_producto: '',
      unidad_medida: '',
    }
  })

  const { control, handleSubmit, reset } = form

  useEffect(() => {
    if (defaultValues) { reset(defaultValues) }
  }, [defaultValues, reset])

  return (
    <Form {...form}>
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

        <FormField
          control={control}
          name="tipo_producto"
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
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unidad de medida</FormLabel>
              <FormControl>
                <Select
                  value={field.value ?? ''}
                  onValueChange={(value) => {
                    // Radix Select renders a hidden native <select> that re-dispatches
                    // a change event when the controlled value changes while the
                    // dropdown items are not mounted. That echo arrives as "" and
                    // would wipe a loaded value, so it is ignored: "" is never a
                    // real choice because no item has an empty value.
                    if (value !== '') field.onChange(value)
                  }}
                >
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
          <AsyncButton type="submit" isLoading={isSubmitting}>{submitLabel}</AsyncButton>
        </div>
      </form>
    </Form>
  )
}
