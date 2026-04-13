// src/components/DosisFields.jsx
import React from 'react'
import { useFieldArray, useWatch } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function DosisFields({
  control,
  productos,
  name = 'dosis',
  showNuevoProductoButton = false,
  onNuevoProducto,
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name
  })

  const dosisValues = useWatch({
    control,
    name,
  })

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">Dosis</div>

      {fields.map((dosisField, index) => {
        const selectedProductoId = dosisValues?.[index]?.producto_id
        const selectedProducto = productos.find(p => String(p.id) === String(selectedProductoId))

        return (
          <div key={dosisField.id} className="flex flex-wrap items-end gap-3">
            <FormField
              control={control}
              name={`${name}.${index}.producto_id`}
              rules={{ required: 'El producto es obligatorio' }}
              render={({ field }) => (
                <FormItem className="min-w-[200px] flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <FormLabel>Producto</FormLabel>
                    {showNuevoProductoButton && index === 0 && typeof onNuevoProducto === 'function' ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={onNuevoProducto}
                      >
                        Nuevo producto
                      </Button>
                    ) : null}
                  </div>
                  <FormControl>
                    <Select value={field.value ?? ''} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {productos.map(producto => (
                            <SelectItem key={producto.id} value={String(producto.id)}>
                              {producto.nombre}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`${name}.${index}.cantidad`}
              rules={{
                required: 'La cantidad es obligatoria',
                min: { value: 0.01, message: 'Debe ser mayor a 0' }
              }}
              render={({ field }) => (
                <FormItem className="w-32">
                  <FormLabel>Cantidad</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      type="number"
                      step="0.01"
                      onChange={(event) => {
                        const value = event.target.value
                        field.onChange(value === '' ? '' : Number(value))
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedProducto ? (
              <span className="text-sm text-muted-foreground pb-2">{selectedProducto.unidad_medida}</span>
            ) : null}

            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => remove(index)}
            >
              Quitar
            </Button>
          </div>
        )
      })}

      {fields.length < 10 && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => append({ producto_id: '', cantidad: '' })}
        >
          Agregar dosis
        </Button>
      )}
    </div>
  )
}
