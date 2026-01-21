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


export default function SelectField({ field, label, options, className = '' }) {
  return (
    <Select value={field.value ?? ''} onValueChange={field.onChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Seleccionar..." />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {label ? <SelectLabel>{label}</SelectLabel> : null}
          {options.map(option => (
            <SelectItem key={String(option.id)} value={String(option.id)}>{option.nombre}</SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
