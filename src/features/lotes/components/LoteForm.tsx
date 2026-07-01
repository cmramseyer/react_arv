import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'

import { useLoteQueryById, useLoteMutation } from '@/features/lotes/hooks/useLoteQuery'
import { useEstanciasQuery } from '@/features/estancias/hooks/useEstanciaQuery'

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import SelectField from '@/features/ordenes-fumigacion/components/SelectField'
import { AdjuntosList } from '@/features/lotes/components/AdjuntosList'
import { loteSchema } from '@/features/lotes/schemas/loteSchema'
import { mapLoteFormValuesToFormData } from '@/features/lotes/mappers/loteMappers'
import type { EntityId } from '@/utils/types'
import type { LoteFormValues } from '@/features/lotes/schemas/loteSchema'

type LoteFormEditProps = {
  formAction: 'edit',
  loteId: EntityId
}

type LoteFormCreateProps = {
  formAction: 'create',
  loteId?: never
}

type LoteFormProps = LoteFormEditProps | LoteFormCreateProps


export default function LoteForm({ formAction, loteId }: LoteFormProps) {

  const navigate = useNavigate()

  const isEdit = formAction === 'edit'

  const loteQueryEnabled = isEdit

  const loteQuery = useLoteQueryById(loteId, loteQueryEnabled)
  const estanciasQuery = useEstanciasQuery()

  const emptyValues = {
    nombre: '',
    lat: undefined,
    long: undefined,
    link_mapa: '',
    hectareas: '',
    estancia_id: '',
  } 
  
  const defaultValues: LoteFormValues = {
    nombre: loteQuery.data?.nombre ?? '',
    lat: loteQuery.data?.lat ?? '',
    long: loteQuery.data?.long ?? '',
    link_mapa: loteQuery.data?.link_mapa ?? '',
    hectareas: loteQuery.data?.hectareas ? String(loteQuery.data.hectareas) : '',
    estancia_id: loteQuery.data?.estancia_id ? String(loteQuery.data?.estancia_id) : '',
  }
   
  const form = useForm<LoteFormValues>({
    resolver: zodResolver(loteSchema),
    defaultValues: emptyValues
  })
  const { handleSubmit, reset, control, formState } = form

  const showAdjuntos = isEdit

  useEffect(() => {
    if (!isEdit || !loteQuery.data || formState.isDirty) return
    reset(defaultValues || {})
  }, [loteQuery.data, reset])
 

  const { createMutation, updateMutation } = useLoteMutation()

  const handleCreate = async (formData: LoteFormValues) => {
    const data: FormData = mapLoteFormValuesToFormData(formData)
    
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

  const handleUpdate = async (formData: LoteFormValues) => {
    if(!isEdit) return
    const data: FormData = mapLoteFormValuesToFormData(formData, { includeAdjuntos: showAdjuntos })

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
        <form noValidate onSubmit={handleSubmit(isEdit ? handleUpdate : handleCreate)} className="space-y-4">
          <FormField
            control={control}
            name="estancia_id"
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
                      field.onChange(value)
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
