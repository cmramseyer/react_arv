import React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { Estancia } from '@/features/estancias/types'

type EstanciaFilterSelectProps = {
  estancias: Estancia[],
  selectedEstanciaId: number | string,
  onSelect: () => void,
  onResetSelect: () => void
}

export default function EstanciaFilterSelect({ estancias, selectedEstanciaId, onSelect, onResetSelect }: EstanciaFilterSelectProps) {

  return (
    <>
      <Select value={selectedEstanciaId || 'all'} onValueChange={onSelect}>
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Todas las estancias" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las estancias</SelectItem>
          {estancias.map((estancia) => (
            <SelectItem key={String(estancia.id)} value={String(estancia.id)}>
              {estancia.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedEstanciaId && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onResetSelect}
          aria-label="Limpiar filtro"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </>  
  )
}
