import React, { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { useParams, useNavigate } from 'react-router-dom'
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

import OrdenFumigacionForm from '@/components/OrdenFumigacionForm'
import OrdenFumigacionEditForm from '@/components/OrdenFumigacionEditForm'

export default function OrdenFumigacionEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  //  useEffect(() => {
  //    const fetchData = async () => {
  //      const orden = await getOrdenFumigacion(id)
  //      setEstadoOrden(orden.estado_orden)

  //      if (orden.estancia_id) {
  //        const lotesData = await getLotesPorEstancia(orden.estancia_id)
  //        setLotes(lotesData)
  //      }

  //      const mappedLotes = Array.isArray(orden.lotes) && orden.lotes.length > 0
  //         ? orden.lotes.map(lote => ({
  //             id: lote.id,
  //             lote_id: lote.lote_id ? String(lote.lote_id) : '',
  //             hectareas_reales: lote.hectareas_reales ?? '',
  //             dosis: (lote.dosis || []).map(dosis => ({
  //               id: dosis.id,
  //               producto_id: dosis.producto_id ? String(dosis.producto_id) : '',
  //               cantidad: dosis.cantidad ?? ''
  //             }))
  //           }))
  //         : [{ lote_id: '', hectareas_reales: '', dosis: [{ producto_id: '', cantidad: '' }] }]

  //        reset({
  //          estancia_id: String(orden.estancia_id) || '',
  //          cultivo_id: String(orden.cultivo?.id) || '',
  //          datos_clima: orden.datos_clima || '',
  //          info_trabajo: orden.info_trabajo || '',
  //          creator: orden.creator || '',
  //          fecha_trabajo: orden.fecha_trabajo || '',
  //          maquinista_id: orden.maquinista?.id || '',
  //          sensible: orden.sensible ?? false,
  //          comentarios: orden.comentarios || '',
  //          lotes: mappedLotes
  //        })
  //     }

  //    fetchData()
  //  }, [id, reset])


  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Editar Orden de Fumigación</h2>

      <OrdenFumigacionForm formAction="edit" ordenId={id} />





    </div>
  )
}
