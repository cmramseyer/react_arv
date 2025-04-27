// src/components/DosisFields.jsx
import React from 'react'
import { useFieldArray } from 'react-hook-form'

export default function DosisFields({ control, register, productos }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'dosis'
  })

  return (
    <div>
      <label>Dosis</label>
      {fields.map((field, index) => (
        <div key={field.id} className="flex space-x-2 mb-2">
          <select {...register(`dosis.${index}.producto_id`, { required: true })} className="border p-2">
            <option value="">Producto</option>
            {productos.map(producto => (
              <option key={producto.id} value={producto.id}>{producto.nombre}</option>
            ))}
          </select>
          <input
            {...register(`dosis.${index}.cantidad`, { required: true, min: 0.01 })}
            type="number"
            step="0.01"
            placeholder="Cantidad"
            className="border p-2 w-24"
          />
          <button type="button" onClick={() => remove(index)} className="text-red-500">X</button>
        </div>
      ))}

      {fields.length < 10 && (
        <button type="button" onClick={() => append({ producto_id: '', cantidad: '' })} className="text-green-500">
          + Agregar Dosis
        </button>
      )}
    </div>
  )
}
