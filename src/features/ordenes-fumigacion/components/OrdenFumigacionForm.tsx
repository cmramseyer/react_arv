import React, { useEffect, useState, useRef } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { Form, FormDescription, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import DosisFields from '@/features/ordenes-fumigacion/components/DosisFields'
import SelectField from '@/features/ordenes-fumigacion/components/SelectField'
import { formatHectareas, getTotalHectareas } from '@/utils/formatHectareas'
import ProductoNuevoDialog from '@/features/productos/components/ProductoNuevoDialog'
import OrdenFumigacionEditForm from '@/features/ordenes-fumigacion/components/OrdenFumigacionEditForm'

import { useOrdenFumigacionMutation } from '@/features/ordenes-fumigacion/hooks/useOrdenFumigacionQuery'
import { useProductosMutation } from '@/features/productos/hooks/useProductoQuery'
import { useLotesByEstanciaQuery } from '@/features/lotes/hooks/useLoteQuery'
import { useOrdenFumigacionEditLoader } from '../hooks/useOrdenFumigacionEditLoader'
import { ordenFumigacionSchema } from '@/features/ordenes-fumigacion/schemas/ordenFumigacionSchema'
import { mapOrdenFumigacionFormValuesToPayload } from '@/features/ordenes-fumigacion/mappers/ordenFumigacionMappers'
import type { OrdenFumigacionFormValues } from '@/features/ordenes-fumigacion/schemas/ordenFumigacionSchema'


export default function OrdenFumigacionForm({ formAction, ordenId }) {
  const isEdit = formAction === 'edit'

  const form = useForm<OrdenFumigacionFormValues>({
    resolver: zodResolver(ordenFumigacionSchema),
    defaultValues: {
      estancia_id: '',
      cultivo_id: '',
      sensible: false,
      comentarios: '',
      lotes: [
        { lote_id: '', hectareas_reales: '', dosis: [{ producto_id: '', cantidad: '' }] }
      ]
    }
  })

  const { handleSubmit, control, watch } = form
  const { fields: loteFields, append: appendLote, remove: removeLote } = useFieldArray({
    control,
    name: 'lotes'
  })

  const {
    isReady,
    initialValues,
    options: { estancias, productos, cultivos, lotes: editLotes },
    queries: { ordenFumigacionQuery },
  } = useOrdenFumigacionEditLoader(isEdit ? ordenId : null)

  const estadoOrden = ordenFumigacionQuery.data?.estado_orden
  const estanciaId = watch('estancia_id')
  const selectedLotes = watch('lotes')
  const createLotesQuery = useLotesByEstanciaQuery(
    estanciaId,
    !isEdit && Boolean(estanciaId),
  )
  const lotes = isEdit ? editLotes : createLotesQuery.data || []

  const { createProductoMutation } = useProductosMutation()
  const { updateMutation: updateOrdenFumigacionMutation, createMutation: createOrdenFumigacionMutation } = useOrdenFumigacionMutation()

  const [isNuevoProductoOpen, setIsNuevoProductoOpen] = useState(false)
  const navigate = useNavigate()

  const totalHectareas = getTotalHectareas(selectedLotes, lotes)

  const initializedRef = useRef(false);

  useEffect(() => {
    if (!isEdit) return;
    if (!isReady) return;
    if (initializedRef.current) return;
    form.reset(initialValues);
    initializedRef.current = true;
  }, [isEdit, isReady, initialValues, form]);

  const handleProductoOpen = (productoOpen) => {
    setIsNuevoProductoOpen(productoOpen)
  }


  const onSubmit = async (data) => {
    const payload = mapOrdenFumigacionFormValuesToPayload(data)

    try {
      if (isEdit) {
        await updateOrdenFumigacionMutation.mutateAsync({id: ordenId, payload})
        navigate(`/ordenes_fumigacion`)
        return
      }
      await createOrdenFumigacionMutation.mutateAsync(payload)
      navigate('/ordenes_fumigacion')
     } catch(error) {
      console.log("error catch")
      console.log(error)
    }
  }

  const handleCreateProducto = async (data) => {
    try {
      await createProductoMutation.mutateAsync(data)
      setIsNuevoProductoOpen(false)
    } catch(error) {
      console.log('error catch create producto')
      console.log(error)
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
                <FormDescription>Estancia desc.</FormDescription>
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

        {loteFields.map((field, index) => (
          <div key={field.id} className="space-y-4 rounded border p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Lote {index + 1}</h3>
              {loteFields.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeLote(index)}
                >
                  Quitar lote
                </Button>
              )}
            </div>

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
                      getOptionLabel={(lote) => {
                        const nombre = lote.nombre_lote || lote.nombre || 'Sin nombre'
                        return `${nombre} - ${formatHectareas(lote.hectareas)}`
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`lotes.${index}.hectareas_reales`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ajuste Ha</FormLabel>
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
              control={control}
              productos={productos}
              name={`lotes.${index}.dosis`}
              showNuevoProductoButton
              onNuevoProducto={() => setIsNuevoProductoOpen(true)}
            />
          </div>
        ))}

        <Button
          type="button"
          variant="secondary"
          onClick={() => appendLote({ lote_id: '', hectareas_reales: '', dosis: [{ producto_id: '', cantidad: '' }] })}
        >
          Agregar otro lote
        </Button>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit">{ isEdit ? "Actualizar" : "Crear" }</Button>
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
        <OrdenFumigacionEditForm ordenId={ordenFumigacionQuery.data} control={control} estadoOrden={estadoOrden} /> 
      }

      <ProductoNuevoDialog
        isNuevoProductoOpen={isNuevoProductoOpen}
        onClose={() => setIsNuevoProductoOpen(false)}
        onCreate={handleCreateProducto}
        onProductoOpen={handleProductoOpen}
      />
    </Form>
  )
}
