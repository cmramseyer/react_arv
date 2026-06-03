import React from 'react'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


export default function SelectField({ field, label, options, className = '', getOptionLabel }) {
  console.log(`options in SelectField: ${JSON.stringify(options)}`)

  if (!options) { return <div>Cargando...</div>}
  if (options.length === 0) { return <div>Cargando...</div>}

  const getLabel = getOptionLabel || ((option) => option.nombre)

  return (
    <Select value={field.value ?? ''} onValueChange={field.onChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Seleccionar..." />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {label ? <SelectLabel>{label}</SelectLabel> : null}
          {options.map(option => (
            <SelectItem key={String(option.id)} value={String(option.id)}>{getLabel(option)}</SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
