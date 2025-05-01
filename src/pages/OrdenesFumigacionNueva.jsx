import React, { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { getEstancias } from '../services/estanciasService'
import { getLotesPorEstancia } from '../services/lotesService'
import { getProductos } from '../services/productosService'
import { createOrdenFumigacion } from '../services/ordenesFumigacionService'
import { useNavigate } from 'react-router-dom'
import { Form , FormDescription, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import DosisFields from '../components/DosisFields'
import SelectField from '../components/SelectField'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function OrdenFumigacionNueva() {
  const form = useForm({
    defaultValues: {
      lote_id: '',
      dosis: [{ producto_id: '', cantidad: '' }]
    }
  })

  const { register, handleSubmit, control, watch, setValue } = form

  const [estancias, setEstancias] = useState([])
  const [lotes, setLotes] = useState([])
  const [productos, setProductos] = useState([])
  const navigate = useNavigate()

  const estanciaId = watch('estancia_id')

  useEffect(() => {
    getEstancias().then(setEstancias)
    getProductos().then(setProductos)
  }, [])

  useEffect(() => {
    if (estanciaId) {
      getLotesPorEstancia(estanciaId).then(setLotes)
    } else {
      setLotes([])
    }
  }, [estanciaId])

  const onSubmit = async (data) => {
    const formData = new FormData()

    formData.append('orden_fumigacion[lote_id]', data.lote_id)
    formData.append('orden_fumigacion[creado_por]', 'carlos')
  
    data.dosis.forEach((dosis, index) => {
      if (dosis.producto_id && dosis.cantidad) {
        formData.append(`orden_fumigacion[dosis_attributes][${index}][producto_id]`, dosis.producto_id)
        formData.append(`orden_fumigacion[dosis_attributes][${index}][cantidad]`, dosis.cantidad)
      }
    })
  
    await createOrdenFumigacion(formData)
    navigate('/ordenes_fumigacion')
  }

  return (
    
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={control}
          name="estancia_id"
          render={({field}) => (
            <FormItem>
              <FormLabel>Estancia</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Seleccionar Estancia"/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Estancias</SelectLabel>
                      {estancias.map(estancia => (
                        <SelectItem value={String(estancia.id)}>{estancia.nombre}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>Estancia desc.</FormDescription>
              <FormMessage/>
            </FormItem>
          )}
        />
          
          <FormField
          control={control}
          name="lote_id"
          render={({field}) => (
            <FormItem>
              <FormLabel>Lote</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Seleccionar lotes"/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Lotes</SelectLabel>
                      {lotes.map(lote => (
                        <SelectItem value={String(lote.id)}>{lote.nombre}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>Lote desc.</FormDescription>
              <FormMessage/>
            </FormItem>
          )}
        />

        <DosisFields control={control} register={register} productos={productos} />

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Crear Orden
        </button>
      </form>
    </Form>
  )
}
