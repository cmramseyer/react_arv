import React from 'react'

export default function SelectField({ label, name, options, register, required = false, className = '' }) {
  return (
    <div>
      <label>{label}</label>
      <select
        {...register(name, { required })}
        className={`block w-full border p-2 ${className}`}
      >
        <option value="">Seleccione {label.toLowerCase()}</option>
        {options.map(option => (
          <option key={option.id} value={option.id}>
            {option.nombre}
          </option>
        ))}
      </select>
    </div>
  )
}
