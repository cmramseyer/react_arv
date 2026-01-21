import React, { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { getEstancias } from '../services/estanciasService'
import { getLotesPorEstancia } from '../services/lotesService'
import { getProductos } from '../services/productosService'
import { createOrdenFumigacion } from '../services/ordenesFumigacionService'
import { useNavigate } from 'react-router-dom'
import { Form, FormDescription, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import DosisFields from '../components/DosisFields'
import SelectField from '../components/SelectField'


  export default function OrdenFumigacionNueva() {
    const form = useForm({
      defaultValues: {
        estancia_id: '',
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

          <Button type="submit">Crear orden</Button>
        </form>
      </Form>
    )
  }
