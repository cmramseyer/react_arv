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


export default function SelectField({ field, label, name, options, register, required = false, className = '' }) {
  return (
    <Select value={field.value} onValueChange={field.onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={`Seleccionar ${label}`}/>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{label}</SelectLabel>
          {options.map(option => (
            <SelectItem value={String(option.id)}>{option.nombre}</SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}