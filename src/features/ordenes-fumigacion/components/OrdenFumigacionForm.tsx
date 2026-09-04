import React, { useEffect, useState, useRef } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import type { Control, Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Form, FormDescription, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { AsyncButton } from '@/components/ui/async-button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import DosisFields from '@/features/ordenes-fumigacion/components/DosisFields'
import SelectField from '@/features/ordenes-fumigacion/components/SelectField'
import { formatHectareas, getTotalHectareas } from '@/utils/formatHectareas'
import ProductoNuevoDialog from '@/features/productos/components/ProductoNuevoDialog'
import OrdenFumigacionEditForm from '@/features/ordenes-fumigacion/components/OrdenFumigacionEditForm'

import { useOrdenFumigacionMutation } from '@/features/ordenes-fumigacion/hooks/useOrdenFumigacionQuery'
import { useLotesByEstanciaQuery } from '@/features/lotes/hooks/useLoteQuery'
import { useOrdenFumigacionEditLoader } from '../hooks/useOrdenFumigacionEditLoader'
import { ordenFumigacionSchema } from '@/features/ordenes-fumigacion/schemas/ordenFumigacionSchema'
import { mapOrdenFumigacionFormValuesToPayload } from '@/features/ordenes-fumigacion/mappers/ordenFumigacionMappers'
import { toastText } from '@/lib/toast'
import type { OrdenFumigacionFormValues } from '@/features/ordenes-fumigacion/schemas/ordenFumigacionSchema'
import type { EntityId } from '@/utils/types'

type OrdenFumigacionEditFormProps = {
  formAction: 'edit',
  ordenId: EntityId
}

type OrdenFumigacionCreateFormProps = {
  formAction: 'create',
  ordenId?: never
}

type OrdenFumigacionFormProps = OrdenFumigacionCreateFormProps | OrdenFumigacionEditFormProps

export default function OrdenFumigacionForm({ formAction, ordenId }: OrdenFumigacionFormProps) {
  const isEdit = formAction === 'edit'

  const form = useForm<OrdenFumigacionFormValues>({
    resolver: zodResolver(ordenFumigacionSchema) as Resolver<OrdenFumigacionFormValues>,
    defaultValues: {
      estancia_id: '',
      cultivo_id: '',
      sensible: false,
      comentarios: '',
      lotes: []
    }
  })

  const { handleSubmit, control, watch, getValues, setValue } = form
  const { fields: loteFields, append: appendLote, remove: removeLote } = useFieldArray({
    control,
    name: 'lotes'
  })

  const {
    isReady,
    initialValues,
    options: { estancias, productos, cultivos },
    queries: { ordenFumigacionQuery },
  } = useOrdenFumigacionEditLoader(isEdit ? ordenId : null)

  const estadoOrden = ordenFumigacionQuery.data?.estado_orden
  const estanciaId = watch('estancia_id')
  const selectedLotes = watch('lotes') || []
  const lotesQuery = useLotesByEstanciaQuery(
    estanciaId,
    Boolean(estanciaId),
  )
  const lotes = lotesQuery.data || []

  const { updateMutation: updateOrdenFumigacionMutation, createMutation: createOrdenFumigacionMutation } = useOrdenFumigacionMutation()

  const [isNuevoProductoOpen, setIsNuevoProductoOpen] = useState(false)
  const navigate = useNavigate()

  const activeLoteFields = loteFields.filter((_, index) => !selectedLotes[index]?.eliminado)
  const totalHectareas = getTotalHectareas(selectedLotes.filter((lote) => !lote.eliminado), lotes)

  const initializedRef = useRef(false);

  useEffect(() => {
    if (!isEdit) return;
    if (!isReady) return;
    if (initializedRef.current) return;
    if (!initialValues) return;
    form.reset(initialValues);
    initializedRef.current = true;
  }, [isEdit, isReady, initialValues, form]);

  const previousEstanciaId = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (previousEstanciaId.current && estanciaId && previousEstanciaId.current !== estanciaId) {
      getValues('lotes').forEach((lote, index) => {
        if (!lote.es_manual && !lote.eliminado) {
          setValue(`lotes.${index}.lote_id`, '')
          setValue(`lotes.${index}.hectareas_reales`, '')
        }
      })
    }

    previousEstanciaId.current = estanciaId
  }, [estanciaId, getValues, setValue])

  const handleProductoOpen = (productoOpen) => {
    setIsNuevoProductoOpen(productoOpen)
  }


  const onSubmit = async (data) => {
    const payload = mapOrdenFumigacionFormValuesToPayload(data)

    if (isEdit) {
      const promise = updateOrdenFumigacionMutation.mutateAsync({id: ordenId, payload})
      toast.promise(promise, toastText('orden_fumigacion', 'update'))
      try {
        await promise
      } catch {
        // Sonner reports the failure to the user.
        return
      }
      navigate(`/ordenes_fumigacion`)
      return
    }
    try {
      await createOrdenFumigacionMutation.mutateAsync(payload)
      navigate('/ordenes_fumigacion')
     } catch {
       return
     }
  }

  return (
    <Form {...form}>
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={control}
            name="estancia_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estancia</FormLabel>
                <FormControl>
                  <SelectField field={field} label="Estancia" options={estancias || []} />
                </FormControl>
                <FormDescription>Seleccione una estancia antes de agregar lotes.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="cultivo_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cultivo</FormLabel>
                <FormControl>
                  <SelectField field={field} label="Cultivo" options={cultivos} />
                </FormControl>
                <FormDescription>Opcional</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="sensible"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start gap-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={!!field.value}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                  />
                </FormControl>
                <div className="space-y-1">
                  <FormLabel>Sensible</FormLabel>
                  <FormDescription>Marcar si requiere atencion especial.</FormDescription>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="comentarios"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comentarios</FormLabel>
                <FormControl>
                  <textarea
                    {...field}
                    value={field.value ?? ''}
                    className="min-h-[96px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="Agregar comentarios"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        {loteFields.map((field, index) => {
          const lote = selectedLotes[index]
          if (lote?.eliminado) return null
          const esManual = Boolean(lote?.es_manual)

          return (
          <div key={field.id} className="space-y-4 rounded border p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{esManual ? 'Lote manual' : 'Lote existente'} {activeLoteFields.findIndex((activeField) => activeField.id === field.id) + 1}</h3>
              {activeLoteFields.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (lote?.orden_lote_id) {
                      setValue(`lotes.${index}.eliminado`, true)
                      return
                    }
                    removeLote(index)
                  }}
                >
                  Quitar lote
                </Button>
              )}
            </div>

            {esManual ? (
              <FormField
                control={control}
                name={`lotes.${index}.nombre_manual`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del lote manual</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ''} placeholder="Ej. Sector detrás del galpón" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={control}
                name={`lotes.${index}.lote_id`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lote</FormLabel>
                    <FormControl>
                      <SelectField
                        field={field}
                        label="Lote"
                        options={lotes}
                        disabled={!estanciaId}
                        getOptionLabel={(lote) => {
                          const nombre = lote.nombre || 'Sin nombre'
                          return `${nombre} - ${formatHectareas(lote.hectareas)}`
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={control}
              name={`lotes.${index}.hectareas_reales`}
              render={({ field }) => (
                <FormItem>
                    <FormLabel>{esManual ? 'Hectareas' : 'Ajuste Ha'}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="any"
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DosisFields
              control={control as unknown as Control}
              productos={productos}
              name={`lotes.${index}.dosis`}
              showNuevoProductoButton
              onNuevoProducto={() => setIsNuevoProductoOpen(true)}
            />
          </div>
          )
        })}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={!estanciaId}
            onClick={() => appendLote({ lote_id: '', es_manual: false, hectareas_reales: '', dosis: [] })}
          >
            Agregar lote existente
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={!estanciaId}
            onClick={() => appendLote({ lote_id: '', nombre_manual: '', es_manual: true, hectareas_reales: '', dosis: [] })}
          >
            Agregar lote manual
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <AsyncButton type="submit" isLoading={isEdit ? updateOrdenFumigacionMutation.isPending : false}>
            { isEdit ? "Actualizar" : "Crear" }
          </AsyncButton>
          <Button type="button" variant="secondary" onClick={() => navigate('/ordenes_fumigacion')}>
            Volver
          </Button>
          <span className="text-sm text-muted-foreground">
            Total ha: {totalHectareas === 0 ? '0' : formatHectareas(totalHectareas)}
          </span>
        </div>
      </form>

      { ordenFumigacionQuery.data && 
        estadoOrden === 'terminada' &&
        <OrdenFumigacionEditForm control={control} estadoOrden={estadoOrden} /> 
      }

      <ProductoNuevoDialog
        isNuevoProductoOpen={isNuevoProductoOpen}
        onProductoOpen={handleProductoOpen}
      />
    </Form>
  )
}
