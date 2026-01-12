// src/components/DosisFields.jsx
import React from 'react'
import { useFieldArray, useWatch } from 'react-hook-form'

export default function DosisFields({ control, register, productos }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'dosis'
  })

  // 👀 Escuchamos los valores de todo el array dosis
  const dosisValues = useWatch({
    control,
    name: 'dosis',
  })

  return (
    <div>
      <label className="block font-bold mb-2">Dosis</label>

      {fields.map((field, index) => {
        // valor seleccionado en este índice
        const selectedProductoId = dosisValues?.[index]?.producto_id
        const selectedProducto = productos.find(p => String(p.id) === String(selectedProductoId))

        return (
          <div key={field.id} className="flex items-center space-x-2 mb-2">
            <select
              {...register(`dosis.${index}.producto_id`, { required: true })}
              className="border p-2"
            >
              <option value="">Producto</option>
              {productos.map(producto => (
                <option key={producto.id} value={producto.id}>
                  {producto.nombre}
                </option>
              ))}
            </select>

            <input
              {...register(`dosis.${index}.cantidad`, { required: true, min: 0.01, valueAsNumber: true })}
              type="number"
              step="0.01"
              placeholder="Cantidad"
              className="border p-2 w-24"
            />

            {/* ✅ mostramos la unidad si hay producto seleccionado */}
            {selectedProducto && (
              <span className="text-gray-600">{selectedProducto.unidad_medida}</span>
            )}

            <button
              type="button"
              onClick={() => remove(index)}
              className="text-red-500"
            >
              X
            </button>
          </div>
        )
      })}

      {fields.length < 10 && (
        <button
          type="button"
          onClick={() => append({ producto_id: '', cantidad: '' })}
          className="text-green-500"
        >
          + Agregar Dosis
        </button>
      )}
    </div>
  )
}
