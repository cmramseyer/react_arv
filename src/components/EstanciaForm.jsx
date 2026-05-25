import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getEstancia, updateEstancia, createEstancia } from '../services/estanciasService'
import { useNavigate } from 'react-router-dom'

export default function EstanciaForm({ estanciaId, action, onSaved }) {
  const form = useForm({
    defaultValues: {
      nombre: '',
      contacto: '',
      telefono: '',
      email: ''
    }
  })

  const isEdit = action === 'edit'

  const navigate = useNavigate()

  const [estancia, setEstancia] = useState(null)
  const [loading, setLoading] = useState(isEdit ? true : false)

  useEffect(() => {
    if (!isEdit) return
    const fetch = async () => {
      try {
        const data = await getEstancia(estanciaId)
        setEstancia(data)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [estanciaId, isEdit])

  const handleUpdate = async (formData) => {
    await updateEstancia(estanciaId, formData)
    await onSaved()
  }
  
  const handleCreate = async (formData) => {
    await createEstancia(formData)
    await onSaved()
  }

  const { handleSubmit, control, reset } = form

  useEffect(() => {
    if (estancia) reset(estancia)
  }, [estancia, reset])

  if (isEdit && loading) return <div>Cargando...</div>
  if (isEdit && !estancia) return <div>No se encontró la estancia</div>


  return (
    <>
      <Form {...form}>
        <form onSubmit={handleSubmit(isEdit ? handleUpdate : handleCreate)} className="space-y-4">
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
            rules={{ required: 'El contacto es requerido',
              validate: (value) =>
                String(value ?? '').trim().length > 0 || 'El nombre es requerido',
             }}
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
            <Button type="submit">{isEdit ? 'Actualizar' : 'Crear'}</Button>
          </div>
        </form>
      </Form>
      <Button type="button" variant="secondary" onClick={onSaved}>
        Volver
      </Button>
    </>
  )
}
