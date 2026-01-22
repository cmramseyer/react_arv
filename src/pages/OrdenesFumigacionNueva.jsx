import React, { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { getEstancias } from '../services/estanciasService'
import { getLotesPorEstancia } from '../services/lotesService'
import { getProductos } from '../services/productosService'
import { getCultivos } from '../services/cultivosService'
import { createOrdenFumigacion } from '../services/ordenesFumigacionService'
import { useNavigate } from 'react-router-dom'
import { Form, FormDescription, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import DosisFields from '../components/DosisFields'
import SelectField from '../components/SelectField'
import formatHectareas from '../utils/formatHectareas'


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
    const loteData = lotesById.get(String(lote.lote_id))
    if (!loteData) return acc
    const hectareasValue = parseHectareasValue(loteData.hectareas)
    if (hectareasValue === null) return acc
    return acc + hectareasValue
  }, 0)
}

  export default function OrdenFumigacionNueva() {
    const form = useForm({
      defaultValues: {
        estancia_id: '',
        cultivo_id: '',
        lotes: [
          { lote_id: '', dosis: [{ producto_id: '', cantidad: '' }] }
        ]
      }
    })

    const { handleSubmit, control, watch } = form
    const { fields: loteFields, append: appendLote, remove: removeLote } = useFieldArray({
      control,
      name: 'lotes'
    })

    const [estancias, setEstancias] = useState([])
    const [lotes, setLotes] = useState([])
    const [productos, setProductos] = useState([])
    const [cultivos, setCultivos] = useState([])
    const navigate = useNavigate()

    const estanciaId = watch('estancia_id')
    const selectedLotes = watch('lotes')
    const totalHectareas = getTotalHectareas(selectedLotes, lotes)

    useEffect(() => {
      getEstancias().then(setEstancias)
      getProductos().then(setProductos)
      getCultivos().then(setCultivos)
    }, [])

    useEffect(() => {
      if (estanciaId) {
        getLotesPorEstancia(estanciaId).then(setLotes)
      } else {
        setLotes([])
      }
    }, [estanciaId])

    const onSubmit = async (data) => {
      const payload = {
        orden_fumigacion: {
          estancia_id: data.estancia_id,
          lotes: (data.lotes || [])
            .filter(lote => lote.lote_id)
            .map(lote => ({
              lote_id: lote.lote_id,
              dosis: (lote.dosis || [])
                .filter(dosis => dosis.producto_id && dosis.cantidad !== '' && dosis.cantidad !== null)
                .map(dosis => ({
                  producto_id: dosis.producto_id,
                  cantidad: dosis.cantidad
                }))
            }))
        }
      }

      if (data.cultivo_id) {
        payload.orden_fumigacion.cultivo_id = data.cultivo_id
      }

      await createOrdenFumigacion(payload)
      navigate('/ordenes_fumigacion')
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
                   <SelectField field={field} label="Estancia" options={estancias} />
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

          <div className="flex items-center gap-3">
            <Button type="submit">Crear orden</Button>
            <span className="text-sm text-muted-foreground">
              Total ha: {totalHectareas === 0 ? '0' : formatHectareas(totalHectareas)}
            </span>
          </div>
        </form>
      </Form>
    )
  }
