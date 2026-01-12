  import React, { useEffect, useState } from 'react'
  import { useForm, useFieldArray, useWatch } from 'react-hook-form'
  import { getEstancias } from '../services/estanciasService'
  import { getLotesPorEstancia } from '../services/lotesService'
  import { getProductos } from '../services/productosService'
  import { createOrdenFumigacion } from '../services/ordenesFumigacionService'
  import { useNavigate } from 'react-router-dom'
  import { Form , FormDescription, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
  import { Input } from '@/components/ui/input'
  import { Switch } from '@/components/ui/switch'
  import { Label } from '@/components/ui/label'
  import DosisFields from '../components/DosisFields'
  import SelectField from '../components/SelectField'


  export default function OrdenFumigacionNueva() {
    const form = useForm({
      defaultValues: {
        lote_ids: [],
        temp_lotes: '',
        temp_hectareas: '',
        dosis: [{ producto_id: '', cantidad: '' }]
      }
    })

    const { register, handleSubmit, control, watch, setValue } = form

    const [estancias, setEstancias] = useState([])
    const [lotes, setLotes] = useState([])
    const [productos, setProductos] = useState([])
    const [loteCargado, setLoteCargado] = useState(true)
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

    const selectedLoteIds = watch('lote_ids') || []
    const totalHectareasSeleccionadas = React.useMemo(() => {
      if (!Array.isArray(selectedLoteIds)) return 0
      return selectedLoteIds.reduce((sum, id) => {
        const lote = lotes.find(l => String(l.id) === String(id))
        const hect = parseFloat(lote?.hectareas ?? 0)
        return sum + (isNaN(hect) ? 0 : hect)
      }, 0)
    }, [selectedLoteIds, lotes])


    const onSubmit = async (data) => {
      const formData = new FormData()

      data.lote_ids.forEach(id => {
        formData.append('orden_fumigacion[lote_ids][]', id)
      })
      
      formData.append('orden_fumigacion[creado_por]', 'carlos')

      formData.append(`orden_fumigacion[temp_lotes]`, data.temp_lotes)
      formData.append(`orden_fumigacion[temp_hectareas]`, data.temp_hectareas)
    
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
          <div className="flex items-center space-x-2">
            <Switch id="lote-cargado" checked={loteCargado} onCheckedChange={setLoteCargado} />
            <Label htmlFor="lote-cargado">Lote cargado</Label>
          </div>

          {loteCargado ? (
            <>
              <FormField
                control={control}
                name="estancia_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estancia</FormLabel>
                    <FormControl>
                      <SelectField field={field} label="estancia" options={estancias} register={register} control={control} />
                    </FormControl>
                    <FormDescription>Estancia desc.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="lote_ids"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lotes (uno o varios) <span className="ml-2 text-sm text-gray-600"> {totalHectareasSeleccionadas.toFixed(2)} ha</span></FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        multiple
                        className="w-full border rounded p-2"
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions).map(option => option.value)
                          field.onChange(selected)
                        }}
                      >
                        {lotes.map((lote) => (
                          <option key={lote.id} value={lote.id}>
                            {lote.nombre}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormDescription>Puedes seleccionar uno o más lotes.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          ) : (
            <>
              <FormField
                control={control}
                name="temp_lotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lote (texto libre)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="temp_hectareas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hectáreas (texto libre)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <DosisFields control={control} register={register} productos={productos} />

          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Crear Orden
          </button>
        </form>
      </Form>
    )
  }
