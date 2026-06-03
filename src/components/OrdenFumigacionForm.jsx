import React, { useCallback, useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { createProducto, getProductos } from '../services/productosService'
import { createOrdenFumigacion } from '../services/ordenesFumigacionService'
import { useNavigate } from 'react-router-dom'
import { Form, FormDescription, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import DosisFields from '../components/DosisFields'
import SelectField from '../components/SelectField'
import { formatHectareas, getTotalHectareas } from '../utils/formatHectareas'
import ProductoNuevoDialog from '../components/ProductoNuevoDialog'

import { useEstanciasQuery } from '@/hooks/useEstanciaQuery'
import { useLotesByEstanciaQuery } from '@/hooks/useLoteQuery'
import { useCultivosQuery } from '@/hooks/useCultivoQuery'
import { useProductosQuery, useProductosMutation } from '@/hooks/useProductoQuery'
import { useOrdenFumigacionMutation } from '@/hooks/useOrdenFumigacionQuery'

export default function OrdenFumigacionForm({ formAction, ordenId }) {
  const form = useForm({
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

  const estanciaId = watch('estancia_id')
  const selectedLotes = watch('lotes')

  const estanciasQuery = useEstanciasQuery()
  const productosQuery = useProductosQuery()
  const cultivosQuery = useCultivosQuery()
  const enabled = true
  const lotesQuery = useLotesByEstanciaQuery(estanciaId, enabled)

  const { createProductoMutation } = useProductosMutation()
  const { createMutation: createOrdenFumigacionMutation } = useOrdenFumigacionMutation()

  // const [estancias, setEstancias] = useState([])
  // const [lotes, setLotes] = useState([])
  // const [productos, setProductos] = useState([])
  // const [cultivos, setCultivos] = useState([])
  const [isNuevoProductoOpen, setIsNuevoProductoOpen] = useState(false)
  const navigate = useNavigate()

  const totalHectareas = getTotalHectareas(selectedLotes, lotesQuery.data)


  const handleProductoOpen = (productoOpen) => {
    setIsNuevoProductoOpen(productoOpen)
  }

  // const loadProductos = useCallback(async () => {
  //   const data = await getProductos()
  //   setProductos(data)
  // }, [])

  // useEffect(() => {
  //   getEstancias().then(setEstancias)
  //   loadProductos()
  //   getCultivos().then(setCultivos)
  // }, [loadProductos])

  // useEffect(() => {
  //   if (estanciaId) {
  //     getLotesPorEstancia(estanciaId).then(setLotes)
  //   } else {
  //     setLotes([])
  //   }
  // }, [estanciaId])

  const onSubmit = async (data) => {
    const payload = {
      orden_fumigacion: {
        estancia_id: data.estancia_id,
        sensible: data.sensible ?? false,
        comentarios: data.comentarios ?? '',
        lotes: (data.lotes || [])
          .filter(lote => lote.lote_id)
          .map(lote => {
            const loteData = {
              lote_id: lote.lote_id,
              dosis: (lote.dosis || [])
              .filter(dosis => dosis.producto_id && dosis.cantidad !== '' && dosis.cantidad !== null)
              .map(dosis => ({
                producto_id: dosis.producto_id,
                cantidad: dosis.cantidad
              }))
            }

            if (lote.hectareas_reales !== '' && lote.hectareas_reales !== null && lote.hectareas_reales !== undefined) {
              loteData.hectareas_reales = lote.hectareas_reales
            }

            return loteData
          })
      }
    }

    if (data.cultivo_id) {
      payload.orden_fumigacion.cultivo_id = data.cultivo_id
    }

    try {
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={control}
            name="estancia_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estancia</FormLabel>
                <FormControl>
                  <SelectField field={field} label="Estancia" options={estanciasQuery.data || []} />
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
                  <SelectField field={field} label="Cultivo" options={cultivosQuery.data} />
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
                      options={lotesQuery.data || []}
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
              productos={productosQuery.data}
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
          <Button type="submit">{ createOrdenFumigacionMutation && createOrdenFumigacionMutation.isSubmitting ? "Creando..." : "Crear orden" }</Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/ordenes_fumigacion')}>
            Volver
          </Button>
          <span className="text-sm text-muted-foreground">
            Total ha: {totalHectareas === 0 ? '0' : formatHectareas(totalHectareas)}
          </span>
        </div>
      </form>

      <ProductoNuevoDialog
        isNuevoProductoOpen={isNuevoProductoOpen}
        onClose={() => setIsNuevoProductoOpen(false)}
        onCreate={handleCreateProducto}
        onProductoOpen={handleProductoOpen}
      />
    </Form>
  )
}
