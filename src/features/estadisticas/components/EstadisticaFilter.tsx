import React from 'react';
import { CalendarIcon } from 'lucide-react'
import { es } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { DateRange } from 'react-day-picker'

type EstadisticasFilterProps = {
  handleMesActual: () => void,
  handleMesAnterior: () => void,
  handleRangoHistorico: () => void,
  range: DateRange,
  setRange: () => void,
  rangeLabel: string
}

export default function EstadisticaFilter({
  handleMesActual,
  handleMesAnterior,
  handleRangoHistorico,
  range,
  setRange,
  rangeLabel}: EstadisticasFilterProps) {

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={handleMesActual}>
          Mes actual
        </Button>
        <Button variant="secondary" onClick={handleMesAnterior}>
          Mes anterior
        </Button>
        <Button variant="secondary" onClick={handleRangoHistorico}>
          Oct25/Mar26
        </Button>
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal md:w-[280px]",
              !range?.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {rangeLabel}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            selected={range}
            onSelect={setRange}
            numberOfMonths={2}
            defaultMonth={range?.from}
            locale={es}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>

  )

} 

      
