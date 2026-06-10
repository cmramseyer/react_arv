import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useProductoQuery, useProductosMutation } from '@/features/productos/hooks/useProductoQuery'
import { useNavigate } from 'react-router-dom'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { productoSchema } from '@/features/productos/schemas/productoSchema'
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

export default function ProductoForm({ formAction, id, onSuccess = null }) {
  
  const isEdit = formAction === 'edit'
  const navigate = useNavigate()

  const emptyValues = {
    nombre: '',
    tipo_producto: '',
    unidad_medida: '',
  }

  const productoQuery = useProductoQuery(id, isEdit)
  
  const form = useForm({
    resolver: zodResolver(productoSchema),
    defaultValues: emptyValues
  })

  const { control, handleSubmit, reset, formState } = form

  const { createMutation, updateMutation } = useProductosMutation()

  const isSubmitting = createMutation.isSubmitting || updateMutation.isSubmitting

  const handleCreate = async (payload) => {
    try {
      await createMutation.mutateAsync(payload)
      if (onSuccess) {
        onSuccess()
      }
    } catch {
      console.log('error create')
    }
  }

  const handleUpdate = async (payload) => {
    try {
      await updateMutation.mutateAsync({id, payload})
      navigate('/productos')
    } catch {
      console.log('error update')
    }
  }

  useEffect(() => {
    console.log(productoQuery.data)
    reset(productoQuery.data)
  }, [productoQuery.data, reset])

  if (productoQuery.isLoading) { return <div>Cargando...</div> }

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
          <Button type="submit" disabled={isSubmitting}>{isEdit ? "Actualizar" : 'Guardar'}</Button>
        </div>
      </form>
    </Form>
  )
}
