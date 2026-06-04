import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { useLoteQueryById, useLoteMutation } from '@/features/lotes/hooks/useLoteQuery'
import { useEstanciasQuery } from '@/hooks/useEstanciaQuery'

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import SelectField from '@/components/SelectField'
import { AdjuntosList } from '@/features/lotes/components/AdjuntosList'

export default function LoteForm({ formAction, loteId = null }) {

  const navigate = useNavigate()

  const isEdit = formAction === 'edit'

  const loteQueryEnabled = isEdit

  const loteQuery = useLoteQueryById(loteId, loteQueryEnabled)
  const estanciasQuery = useEstanciasQuery()

  const emptyValues = {
    nombre: '',
    lat: '',
    long: '',
    link_mapa: '',
    hectareas: '',
    estancia_id: '',
  } 
  
  const defaultValues = {
    nombre: loteQuery.data?.nombre ?? '',
    lat: loteQuery.data?.lat ?? '',
    long: loteQuery.data?.long ?? '',
    link_mapa: loteQuery.data?.link_mapa ?? '',
    hectareas: loteQuery.data?.hectareas ?? '',
    estancia_id: loteQuery.data?.estancia_id ? String(loteQuery.data?.estancia_id) : '',
  }
  
  const form = useForm({
    defaultValues: emptyValues
  })
  const { handleSubmit, reset, control, formState } = form

  const showAdjuntos = isEdit

  useEffect(() => {
    if (!isEdit || !loteQuery.data || formState.isDirty) return
    reset(defaultValues || {})
  }, [loteQuery.data, reset])
 

  const { createMutation, updateMutation } = useLoteMutation()

  const handleCreate = async (formData) => {
    const data = internalData(formData)
    
    console.log(`formData: ${JSON.stringify(formData)}`)
    console.log(`data: ${JSON.stringify(data)}`)

    try {
      await createMutation.mutateAsync(data)
      navigate('/lotes')
    } catch (error) {
      console.log(error)
      console.log('Error submit new lote')
    }
  }

  const internalData = (data) => {
    const formData = new FormData()

    Object.keys(data).forEach((key) => {
      if (key === 'adjuntos') {
        if (showAdjuntos) {
          const files = data.adjuntos
          if (files && files.length) {
            for (let i = 0; i < files.length; i++) {
              formData.append('lote[adjuntos][]', files[i])
            }
          }
        }
      } else {
        // importante: en selects/inputs vacíos puede venir "" — lo mandamos igual
        formData.append(`lote[${key}]`, data[key] ?? '')
      }
    })

    return formData

  }

  const handleUpdate = async (formData) => {
    const {id, created_at, updated_at, ...data} = internalData(formData)

    console.log(`formData: ${JSON.stringify(formData)}`)
    console.log(`data: ${JSON.stringify(data)}`)

    try {
      await updateMutation.mutateAsync({id: loteId, payload: data})
      navigate('/lotes')
    } catch (error) {
      console.log(error)
      console.log('Error submit update lote')
    }
  }

  return (
    <>
      <h2 className="text-xl font-bold mb-4">lalala</h2>
      <Form {...form}>
        <form onSubmit={handleSubmit(isEdit ? handleUpdate : handleCreate)} className="space-y-4">
          <FormField
            control={control}
            name="estancia_id"
            rules={{ required: 'La estancia es obligatoria' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estancia</FormLabel>
                <FormControl>
                  <SelectField field={field} label="Estancia" options={estanciasQuery.data || []} />
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

          {showAdjuntos && (
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
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit">{isEdit ? 'Actualizar' : 'Guardar'}</Button>
          </div>
        </form>
      </Form>

      <AdjuntosList loteId={loteQuery.data?.id} />

      <Button type="button" variant="secondary" onClick={() => navigate('/lotes')}>
        Volver
      </Button>
    </>
  )
}

LoteForm.propTypes = {
  estancias: PropTypes.array.isRequired,
  onSubmit: PropTypes.func.isRequired,       // recibe FormData ya armado
  defaultValues: PropTypes.object,
  submitLabel: PropTypes.string,
  showAdjuntos: PropTypes.bool,
  actions: PropTypes.node,
}
