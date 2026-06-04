import React, { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { useParams, useNavigate } from 'react-router-dom'
import { getOrdenFumigacion, updateOrdenFumigacion } from '@/features/ordenes-fumigacion/api/ordenesFumigacionService'
import { getProductos } from '@/features/productos/api/productosService'
import { getEstancias } from '@/features/estancias/api/estanciasService'
import { getLotesPorEstancia } from '@/features/lotes/api/lotesService'
import { getCultivos } from '@/features/cultivos/api/cultivosService'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Controller } from 'react-hook-form'
import DosisFields from '@/features/ordenes-fumigacion/components/DosisFields'
import SelectField from '@/features/ordenes-fumigacion/components/SelectField'
import { getMaquinistas } from '@/features/maquinistas/api/maquinistasService'
import { formatHectareas } from '@/utils/formatHectareas'

const parseHectareasValue = (value) => {
  if (value === null || value === undefined || value === '') return null
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return null
    const normalized = trimmed.includes(',') && !trimmed.includes('.')
      ? trimmed.replace(',', '.')
      : trimmed
    const numericValue = Number(normalized)
    return Number.isNaN(numericValue) ? null : numericValue
  }
  const numericValue = Number(value)
  return Number.isNaN(numericValue) ? null : numericValue
}

const getTotalHectareas = (selectedLotes, lotesDisponibles) => {
  if (!Array.isArray(selectedLotes) || !Array.isArray(lotesDisponibles)) return 0
  const lotesById = new Map(lotesDisponibles.map((lote) => [String(lote.id), lote]))

  return selectedLotes.reduce((acc, lote) => {
    if (!lote?.lote_id) return acc
    const hectareasRealesValue = parseHectareasValue(lote.hectareas_reales)
    if (hectareasRealesValue !== null) {
      return acc + hectareasRealesValue
    }
    const loteData = lotesById.get(String(lote.lote_id))
    if (!loteData) return acc
    const hectareasValue = parseHectareasValue(loteData.hectareas)
    if (hectareasValue === null) return acc
    return acc + hectareasValue
  }, 0)
}

export default function OrdenFumigacionEditar() {
  const { id } = useParams()
  const navigate = useNavigate()
  const form = useForm({
    defaultValues: {
      estancia_id: '',
      cultivo_id: '',
      lotes: [{ lote_id: '', hectareas_reales: '', dosis: [{ producto_id: '', cantidad: '' }] }],
      creator: '',
      datos_clima: '',
      info_trabajo: '',
      fecha_trabajo: '',
      maquinista_id: '',
      sensible: false,
      comentarios: ''
    }
  })

  const { reset, handleSubmit, control, watch } = form
  const { fields: loteFields, append: appendLote, remove: removeLote } = useFieldArray({
    control,
    name: 'lotes'
  })

    const [productos, setProductos] = useState([])
    const [estancias, setEstancias] = useState([])
    const [lotes, setLotes] = useState([])
    const [maquinistas, setMaquinistas] = useState([])
    const [cultivos, setCultivos] = useState([])
    const [estadoOrden, setEstadoOrden] = useState('')
    const estanciaId = watch('estancia_id')
    const selectedLotes = watch('lotes')
    const totalHectareas = getTotalHectareas(selectedLotes, lotes)

    useEffect(() => {
      getEstancias().then(setEstancias)
      getProductos().then(setProductos)
      getMaquinistas().then(setMaquinistas)
      getCultivos().then(setCultivos)
    }, [])

  useEffect(() => {
    if (estanciaId) {
      getLotesPorEstancia(estanciaId).then(setLotes)
    } else {
      setLotes([])
    }
  }, [estanciaId])

   useEffect(() => {
     const fetchData = async () => {
       const orden = await getOrdenFumigacion(id)
       setEstadoOrden(orden.estado_orden)

       if (orden.estancia_id) {
         const lotesData = await getLotesPorEstancia(orden.estancia_id)
         setLotes(lotesData)
       }

       const mappedLotes = Array.isArray(orden.lotes) && orden.lotes.length > 0
          ? orden.lotes.map(lote => ({
              id: lote.id,
              lote_id: lote.lote_id ? String(lote.lote_id) : '',
              hectareas_reales: lote.hectareas_reales ?? '',
              dosis: (lote.dosis || []).map(dosis => ({
                id: dosis.id,
                producto_id: dosis.producto_id ? String(dosis.producto_id) : '',
                cantidad: dosis.cantidad ?? ''
              }))
            }))
          : [{ lote_id: '', hectareas_reales: '', dosis: [{ producto_id: '', cantidad: '' }] }]

         reset({
           estancia_id: String(orden.estancia_id) || '',
           cultivo_id: String(orden.cultivo?.id) || '',
           datos_clima: orden.datos_clima || '',
           info_trabajo: orden.info_trabajo || '',
           creator: orden.creator || '',
           fecha_trabajo: orden.fecha_trabajo || '',
           maquinista_id: orden.maquinista?.id || '',
           sensible: orden.sensible ?? false,
           comentarios: orden.comentarios || '',
           lotes: mappedLotes
         })
      }

     fetchData()
   }, [id, reset])


  const onSubmit = async (data) => {
    const lotesPayload = (data.lotes || [])
      .filter(lote => lote.lote_id)
      .map(lote => {
        const dosisPayload = (lote.dosis || [])
          .filter(dosis => dosis.producto_id && dosis.cantidad !== '' && dosis.cantidad !== null)
          .map(dosis => {
            const dosisData = {
              producto_id: dosis.producto_id,
              cantidad: dosis.cantidad
            }

            if (dosis.id) {
              dosisData.id = dosis.id
            }

            return dosisData
          })

        const loteData = {
          lote_id: lote.lote_id,
          dosis: dosisPayload
        }

        if (lote.hectareas_reales !== '' && lote.hectareas_reales !== null && lote.hectareas_reales !== undefined) {
          loteData.hectareas_reales = lote.hectareas_reales
        }

        if (lote.id) {
          loteData.id = lote.id
        }

        return loteData
      })

    const ordenPayload = {
      lotes: lotesPayload,
      sensible: data.sensible ?? false,
      comentarios: data.comentarios ?? ''
    }

    if (data.estancia_id) {
      ordenPayload.estancia_id = data.estancia_id
    }

    if (data.cultivo_id) {
      ordenPayload.cultivo_id = data.cultivo_id
    }

     if (data.maquinista_id) {
       ordenPayload.maquinista_id = data.maquinista_id
     }

    if (data.info_trabajo) {
      ordenPayload.info_trabajo = data.info_trabajo
    }

    if (data.fecha_trabajo) {
      ordenPayload.fecha_trabajo = data.fecha_trabajo
    }

    if (data.datos_clima) {
      ordenPayload.datos_clima = data.datos_clima
    }

    await updateOrdenFumigacion(id, { orden_fumigacion: ordenPayload })
    navigate('/ordenes_fumigacion')
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Editar Orden de Fumigación</h2>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
           <FormField
             control={control}
             name="estancia_id"
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
             name="cultivo_id"
             render={({ field }) => (
               <FormItem>
                 <FormLabel>Cultivo</FormLabel>
                 <FormControl>
                   <SelectField field={field} label="Cultivo" options={cultivos} />
                 </FormControl>
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
                 <FormLabel>Sensible</FormLabel>
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

           <FormField
            control={control}
            name="creator"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Creado Por</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} disabled className="bg-gray-100" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

           <FormField
             control={control}
             name="datos_clima"
             render={({ field }) => (
               <FormItem>
                 <FormLabel>Datos Clima</FormLabel>
                 <FormControl>
                   <Input {...field} value={field.value ?? ''} disabled={estadoOrden !== "terminada"} className={estadoOrden !== "terminada" ? "bg-gray-100" : ""} />
                 </FormControl>
                 <FormMessage />
               </FormItem>
             )}
           />

           <FormField
             control={control}
             name="info_trabajo"
             render={({ field }) => (
               <FormItem>
                 <FormLabel>Info Trabajo</FormLabel>
                 <FormControl>
                   <Input {...field} value={field.value ?? ''} disabled={estadoOrden !== "terminada"} className={estadoOrden !== "terminada" ? "bg-gray-100" : ""} />
                 </FormControl>
                 <FormMessage />
               </FormItem>
             )}
           />

           <FormField
             control={control}
             name="fecha_trabajo"
             render={({ field }) => (
               <FormItem>
                 <FormLabel>Fecha Trabajo</FormLabel>
                 <FormControl>
                   <Input {...field} type="date" value={field.value ?? ''} disabled={estadoOrden !== "terminada"} className={estadoOrden !== "terminada" ? "bg-gray-100" : ""} />
                 </FormControl>
                 <FormMessage />
               </FormItem>
             )}
           />

           <FormField
             control={control}
             name="maquinista_id"
             render={({ field }) => (
               <FormItem>
                 <FormLabel>Maquinista</FormLabel>
                 <FormControl>
                    {estadoOrden === "terminada" ? (
                     <Select onValueChange={field.onChange} value={field.value}>
                       <SelectTrigger className="w-full">
                         <SelectValue placeholder="Seleccionar..." />
                       </SelectTrigger>
                       <SelectContent>
                         {maquinistas.map(m => (
                           <SelectItem key={m.id} value={m.id}>
                             {m.nombre}
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   ) : (
                     <Input
                       value={maquinistas.find(m => m.id == field.value)?.nombre || 'No asignado'}
                       disabled
                       className="bg-gray-100"
                     />
                   )}
                 </FormControl>
                 <FormMessage />
               </FormItem>
             )}
           />

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit">Guardar cambios</Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/ordenes_fumigacion')}>
              Volver
            </Button>
            <span className="text-sm text-muted-foreground">
              Total ha: {totalHectareas === 0 ? '0' : formatHectareas(totalHectareas)}
            </span>
          </div>
        </form>
      </Form>
    </div>
  )
}
