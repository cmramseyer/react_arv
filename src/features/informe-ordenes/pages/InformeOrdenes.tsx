import { useEffect, useState } from 'react'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { solicitarInformeOrden } from '@/features/informe-ordenes/api/informeOrdenService'

export default function InformeOrdenes() {
  const [periodo, setPeriodo] = useState(() => new Date())
  const [isGenerating, setIsGenerating] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (pdfUrl && typeof URL.revokeObjectURL === 'function') {
        URL.revokeObjectURL(pdfUrl)
      }
    }
  }, [pdfUrl])

  const handleGenerarInforme = async () => {
    setIsGenerating(true)

    try {
      const blob = await solicitarInformeOrden({
        mes: periodo.getMonth() + 1,
        anio: periodo.getFullYear(),
      })
      const nextPdfUrl = URL.createObjectURL(blob)

      setPdfUrl(nextPdfUrl)
      window.open(nextPdfUrl, '_blank', 'noopener,noreferrer')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-xl font-bold">Informe de órdenes</h2>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn('w-full justify-start text-left font-normal sm:w-[240px]')}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(periodo, 'MMMM yyyy', { locale: es })}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={periodo}
              month={periodo}
              onMonthChange={(month) => setPeriodo(new Date(month.getFullYear(), month.getMonth(), 1))}
              onSelect={(date) => {
                if (date) setPeriodo(new Date(date.getFullYear(), date.getMonth(), 1))
              }}
              captionLayout="dropdown"
              startMonth={new Date(2020, 0)}
              endMonth={new Date()}
              locale={es}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Button onClick={handleGenerarInforme} disabled={isGenerating}>
          {isGenerating ? 'Generando informe...' : 'Generar informe'}
        </Button>
      </div>
    </div>
  )
}
