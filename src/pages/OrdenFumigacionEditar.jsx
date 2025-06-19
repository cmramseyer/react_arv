import React, { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { useParams, useNavigate } from 'react-router-dom'
import { getOrdenFumigacion, updateOrdenFumigacion } from '../services/ordenesFumigacionService'
import { getProductos } from '../services/productosService'
import { getEstancias } from '../services/estanciasService'
import { getLotesPorEstancia } from '../services/lotesService'
import { Form , FormDescription, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import DosisFields from '../components/DosisFields'
import SelectField from '../components/SelectField'

export default function OrdenFumigacionEditar() {
  const { id } = useParams()
  const navigate = useNavigate()
  const form = useForm({
    defaultValues: {
      estancia_id: '',
      lotes_ids: [],
      temp_lotes: '',
      temp_hectareas: '',
      dosis: []
    }
  })

  const { register, reset, handleSubmit, control, watch, setValue } = form
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'dosis'
  })

  const [productos, setProductos] = useState([])
  const [estancias, setEstancias] = useState([])
  const [lotes, setLotes] = useState([])
  const [loteCargado, setLoteCargado] = useState(false)

  const estanciaId = watch('estancia_id')

  useEffect(() => {
    console.log('use1')
    getEstancias().then(setEstancias)
    console.log(estancias)
    getProductos().then(setProductos)
  }, [])

  useEffect(() => {
    console.log('use2')
    if (estanciaId) {
      console.log(estanciaId)
      getLotesPorEstancia(estanciaId).then(setLotes)
    } else {
      setLotes([])
    }
  }, [estanciaId])

  
  useEffect(() => {
    console.log('use3')
    const fetchData = async () => {
      const orden = await getOrdenFumigacion(id)

      console.log(orden)

      if (orden.estancia_id) {
        const lotesData = await getLotesPorEstancia(orden.estancia_id)
        setLotes(lotesData)
      }

      const tieneLotes = (orden.lotes_ids && orden.lotes_ids.length > 0) === true
      setLoteCargado(tieneLotes)

      await getEstancias().then(setEstancias)

      if (estanciaId) {
        console.log(estanciaId)
        await getLotesPorEstancia(estanciaId).then(setLotes)
      } else {
        setLotes([])
      }

      console.log('orden_lote_ids')
      console.log((orden.lotes_ids || []).map(id => String(id)))

      reset({
        estancia_id: String(orden.estancia_id) || '',
        lote_ids: (orden.lotes_ids || []).map(id => String(id)),
        temp_lotes: orden.temp_lotes || '',
        temp_hectareas: orden.temp_hectareas || '',
        datos_clima: orden.datos_clima || '',
        info_trabajo: orden.info_trabajo || '',
        creado_por: orden.creado_por || '',
        fecha_trabajo: orden.fecha_trabajo || '',
        maquinista: orden.maquinista || '',
        dosis: orden.dosis?.map(d => ({
          id: d.id,
          producto_id: d.producto_id,
          cantidad: d.cantidad
        })) || []
      })
    }

    fetchData()
  }, [id, reset, setValue])

  useEffect(() => {
    console.log('use4')
    console.log(loteCargado)
    if (loteCargado === true) {
      setValue('temp_lotes', '')
      setValue('temp_hectareas', '')
    } else {
      setValue('lote_ids', [])
    }
  }, [loteCargado])


  const onSubmit = async (data) => {
    const formData = new FormData()

    if (loteCargado) {
      data.lote_ids.forEach(id => {
        formData.append('orden_fumigacion[lote_ids][]', id)
      })
    } else {
      formData.append('orden_fumigacion[lote_ids][]', [])
      formData.append('orden_fumigacion[temp_lotes]', data.temp_lotes)
      formData.append('orden_fumigacion[temp_hectareas]', data.temp_hectareas)
    }

    formData.append('orden_fumigacion[creado_por]', data.creado_por)
    formData.append('orden_fumigacion[datos_clima]', data.datos_clima || '')
    formData.append('orden_fumigacion[info_trabajo]', data.info_trabajo || '')
    formData.append('orden_fumigacion[fecha_trabajo]', data.fecha_trabajo || '')
    formData.append('orden_fumigacion[maquinista]', data.maquinista || '')

    data.dosis.forEach((dosis, index) => {
      if (dosis._destroy) {
        formData.append(`orden_fumigacion[dosis_attributes][${index}][id]`, dosis.id)
        formData.append(`orden_fumigacion[dosis_attributes][${index}][_destroy]`, '1')
      } else {
        if (dosis.id) {
          formData.append(`orden_fumigacion[dosis_attributes][${index}][id]`, dosis.id)
        }
        formData.append(`orden_fumigacion[dosis_attributes][${index}][producto_id]`, dosis.producto_id)
        formData.append(`orden_fumigacion[dosis_attributes][${index}][cantidad]`, dosis.cantidad)
      }
    })

    await updateOrdenFumigacion(id, formData)
    navigate('/ordenes_fumigacion')
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Editar Orden de Fumigación</h2>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                    <FormLabel>Lotes</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        multiple
                        className="w-full border rounded p-2"
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions).map(option => option.value)
                          setValue('lote_ids', selected)
                        }}
                        value={Array.isArray(field.value) ? field.value : []}
                      >
                        {lotes.map((lote) => (
                          <option key={lote.id} value={String(lote.id)}>
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

          <FormField
            control={control}
            name="creado_por"
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
                  <Input {...field} value={field.value ?? ''} disabled className="bg-gray-100" />
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
                  <Input {...field} value={field.value ?? ''} disabled className="bg-gray-100" />
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
                  <Input {...field} value={field.value ?? ''} disabled className="bg-gray-100" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="maquinista"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maquinista</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} disabled className="bg-gray-100" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DosisFields control={control} register={register} productos={productos} fields={fields} append={append} remove={remove} watch={watch} setValue={setValue} />

          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Guardar Cambios
          </button>
        </form>
      </Form>
    </div>
  )
}
