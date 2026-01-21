import React, { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { useParams, useNavigate } from 'react-router-dom'
import { getOrdenFumigacion, updateOrdenFumigacion } from '../services/ordenesFumigacionService'
import { getProductos } from '../services/productosService'
import { getEstancias } from '../services/estanciasService'
import { getLotesPorEstancia } from '../services/lotesService'
import { getCultivos } from '../services/cultivosService'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Controller } from 'react-hook-form'
import DosisFields from '../components/DosisFields'
import SelectField from '../components/SelectField'
import { getMaquinistas } from '../services/maquinistasService'

export default function OrdenFumigacionEditar() {
  const { id } = useParams()
  const navigate = useNavigate()
  const form = useForm({
    defaultValues: {
      estancia_id: '',
      cultivo_id: '',
      lotes: [{ lote_id: '', dosis: [{ producto_id: '', cantidad: '' }] }],
      creator: '',
      datos_clima: '',
      info_trabajo: '',
      fecha_trabajo: '',
      maquinista_id: ''
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
             dosis: (lote.dosis || []).map(dosis => ({
               id: dosis.id,
               producto_id: dosis.producto_id ? String(dosis.producto_id) : '',
               cantidad: dosis.cantidad ?? ''
             }))
           }))
         : [{ lote_id: '', dosis: [{ producto_id: '', cantidad: '' }] }]

        reset({
          estancia_id: String(orden.estancia_id) || '',
          cultivo_id: String(orden.cultivo?.id) || '',
          datos_clima: orden.datos_clima || '',
          info_trabajo: orden.info_trabajo || '',
          creator: orden.creator || '',
          fecha_trabajo: orden.fecha_trabajo || '',
          maquinista_id: orden.maquinista?.id || '',
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

        if (lote.id) {
          loteData.id = lote.id
        }

        return loteData
      })

    const ordenPayload = {
      lotes: lotesPayload
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
                      <SelectField field={field} label="Lote" options={lotes} />
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
            onClick={() => appendLote({ lote_id: '', dosis: [{ producto_id: '', cantidad: '' }] })}
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

          <Button type="submit">Guardar cambios</Button>
        </form>
      </Form>
    </div>
  )
}
