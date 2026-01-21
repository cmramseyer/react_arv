import React, { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useParams, useNavigate } from 'react-router-dom'
import { getOrdenFumigacion, terminarOrdenFumigacion } from '../services/ordenesFumigacionService'
import { getEstancias } from '../services/estanciasService'
import { getLotesPorEstancia } from '../services/lotesService'
import { getProductos } from '../services/productosService'
import { getMaquinistas } from '../services/maquinistasService'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function OrdenFumigacionTerminar() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { register, handleSubmit, reset, control } = useForm()

  const [orden, setOrden] = useState(null)
  const [estanciaNombre, setEstanciaNombre] = useState('')
  const [loteNombre, setLoteNombre] = useState('')
  const [loteHectareas, setLoteHectareas] = useState('')
   const [productos, setProductos] = useState([])
   const [maquinistas, setMaquinistas] = useState([])

  const formatCantidad = (value) => {
    if (value === null || value === undefined || value === '') return 'Sin datos'
    const numericValue = Number(value)
    if (Number.isNaN(numericValue)) return 'Sin datos'
    return numericValue.toLocaleString('es-AR', { maximumFractionDigits: 2 })
  }

  useEffect(() => {
    const fetchData = async () => {
      const ordenData = await getOrdenFumigacion(id)
      setOrden(ordenData)
      reset(ordenData)

      // Fetch nombre de estancia
      const estancias = await getEstancias()
      const estancia = estancias.find(e => e.id === ordenData.estancia_id)
      setEstanciaNombre(estancia ? estancia.nombre : '')

      // Fetch nombre y hectareas de lote
      const lotes = await getLotesPorEstancia(ordenData.estancia_id)
      const lote = lotes.find(l => l.id === ordenData.lote_id)
      if (lote) {
        setLoteNombre(lote.nombre)
        setLoteHectareas(lote.hectareas)
      }

       // Fetch productos para mostrar nombre en dosis
       const productosData = await getProductos()
       setProductos(productosData)

       // Fetch maquinistas para el select
       const maquinistasData = await getMaquinistas()
       setMaquinistas(maquinistasData)
    }
    fetchData()
  }, [id, reset])

  const onSubmit = async (data) => {
    const payload = {
      orden_fumigacion: {
        datos_clima: data.datos_clima || '',
        info_trabajo: data.info_trabajo || '',
        fecha_trabajo: data.fecha_trabajo || '',
        maquinista_id: data.maquinista_id || '',
      }
    }

    await terminarOrdenFumigacion(id, payload)
    navigate('/ordenes_fumigacion')
  }

  if (!orden) {
    return <div className="p-4">Cargando...</div>
  }

  const lotesOrden = Array.isArray(orden?.lotes) && orden.lotes.length > 0 ? orden.lotes : []

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Terminar Orden de Fumigación</h2>

      {/* Datos fijos no editables */}
      <div className="space-y-2 mb-6">
        <div><strong>Estancia:</strong> {estanciaNombre}</div>
        <div><strong>Lote:</strong> {loteNombre}</div>
        <div><strong>Hectáreas:</strong> {loteHectareas}</div>
        <div><strong>Creado Por:</strong> {orden.creator}</div>
        <div><strong>Estado:</strong> {orden.estado_orden}</div>
         {lotesOrden.length > 0 ? (
           <ul className="space-y-1 text-sm text-muted-foreground">
             {lotesOrden.map((lote, loteIndex) => {
               const loteKey = lote.id ?? lote.lote_id ?? `${orden.id}-${loteIndex}`
               const dosisList = Array.isArray(lote.dosis) ? lote.dosis : []
               const dosisValue = `dosis-${orden.id}-${loteKey}`

               return (
                 <li key={loteKey} className="space-y-2">
                   <div className="flex flex-wrap gap-2">
                     <Badge variant="success">Lote: {lote.nombre || 'Sin nombre'}</Badge>
                     <Badge variant="outline">{lote.hectareas ? `${lote.hectareas} ha` : 'Sin hectareas'}</Badge>
                   </div>
                   <Accordion type="single" collapsible className="w-full">
                     <AccordionItem value={dosisValue} className="rounded-md border border-border">
                       <AccordionTrigger className="group rounded-md bg-muted/40 px-3 py-2 text-sm hover:bg-muted/60">
                         <span className="group-data-[state=open]:hidden">Ver dosis</span>
                         <span className="hidden group-data-[state=open]:inline">Ocultar dosis</span>
                       </AccordionTrigger>
                       <AccordionContent>
                         {dosisList.length > 0 ? (
                           <ul className="space-y-1 text-sm text-muted-foreground">
                             {dosisList.map((dosis, dosisIndex) => {
                               const cantidadLabel = formatCantidad(dosis.cantidad)
                               const unidadLabel = dosis.unidad_medida ? ` (${dosis.unidad_medida})` : ''
                               const producto = productos.find(p => p.id === dosis.producto_id)

                               return (
                                 <li key={dosis.id ?? `${loteKey}-dosis-${dosisIndex}`}>
                                   {producto ? producto.nombre : dosis.producto || 'Producto'}: {cantidadLabel}{unidadLabel}
                                 </li>
                               )
                             })}
                           </ul>
                         ) : (
                           <div className="text-sm text-muted-foreground">Sin dosis cargadas.</div>
                         )}
                       </AccordionContent>
                     </AccordionItem>
                   </Accordion>
                 </li>
               )
             })}
           </ul>
         ) : (
           <div className="text-sm text-muted-foreground">Sin lotes cargados.</div>
         )}
      </div>

      {/* Formulario de campos editables */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label>Datos Clima</label>
          <input {...register('datos_clima')} className="block w-full border p-2" />
        </div>
        <div>
          <label>Info Trabajo</label>
          <input {...register('info_trabajo')} className="block w-full border p-2" />
        </div>
        <div>
          <label>Fecha Trabajo</label>
          <input {...register('fecha_trabajo')} type="date" className="block w-full border p-2" />
        </div>
         <div>
           <label>Maquinista</label>
           <Controller
             name="maquinista_id"
             control={control}
             render={({ field }) => (
               <Select onValueChange={field.onChange} value={field.value}>
                 <SelectTrigger className="w-full border p-2">
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
             )}
           />
         </div>

        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
          Confirmar Terminar
        </button>
      </form>
    </div>
  )
}
