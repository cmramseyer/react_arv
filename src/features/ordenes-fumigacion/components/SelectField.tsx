import React from 'react'
import type { ControllerRenderProps, FieldValues, Path } from 'react-hook-form'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Estancia } from '@/features/estancias/types'
import { Lote } from '@/features/lotes/types'

type SelectFieldProps<
    TFieldValues extends FieldValues, 
    TName extends Path<TFieldValues>
  > = {
  field: ControllerRenderProps<TFieldValues, TName >,
  label: string,
  options: SelectFieldOptionType[],
  className?: string,
  getOptionLabel: (entity: SelectFieldOptionType) => string
}

type SelectFieldOptionType = Estancia | Lote

export default function SelectField({ field, label, options, className = '', getOptionLabel }: SelectFieldProps) {

  console.log("selectfield", { field, label, options })

  // Generic function to get the name of the options
  const getLabel = getOptionLabel || ((option: SelectFieldOptionType) => option.nombre)

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
