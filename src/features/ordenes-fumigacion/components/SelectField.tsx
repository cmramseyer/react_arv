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

type SelectFieldProps<
    TFieldValues extends FieldValues, 
    TName extends Path<TFieldValues>,
    TOption extends SelectFieldOptionType
  > = {
  field: ControllerRenderProps<TFieldValues, TName >,
  label: string,
  options: TOption[],
  className?: string,
  disabled?: boolean,
  getOptionLabel?: (entity: TOption) => string
}

type SelectFieldOptionType = {
  id: number | string
  nombre?: string
}

export default function SelectField<
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues>,
  TOption extends SelectFieldOptionType
>({ field, label, options, className = '', disabled = false, getOptionLabel }: SelectFieldProps<TFieldValues, TName, TOption>) {

  // Generic function to get the name of the options
  const getLabel = getOptionLabel || ((option: TOption) => option.nombre ?? String(option.id))

  return (
    <Select value={field.value ?? ''} onValueChange={field.onChange} disabled={disabled}>
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
