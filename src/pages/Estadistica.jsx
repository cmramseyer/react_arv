import React, { useEffect, useMemo, useState } from 'react'
import { CalendarIcon } from 'lucide-react'
import { endOfMonth, format, startOfMonth, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { getEstadisticas } from '../services/estadisticasService'
import formatHectareas from '../utils/formatHectareas'

const emptyStats = {
  hectareas_por_propietario: [],
  hectareas_por_maquinista: [],
  hectareas_por_cultivo: [],
}

const normalizeList = (list) => (Array.isArray(list) ? list : [])

const toNumber = (value) => {
  const parsed = Number(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

const buildChartData = (list, labelKey) =>
  normalizeList(list).map((item) => ({
    label: item?.[labelKey] ?? 'Sin datos',
    hectareas: toNumber(item?.hectareas),
  }))

const formatApiDate = (date) => format(date, 'yyyy-MM-dd')
const formatDisplayDate = (date) => format(date, 'dd/MM/yyyy')

const createChartConfig = (colorVar) => ({
  hectareas: {
    label: 'Hectáreas',
    color: `var(${colorVar})`,
  },
})

export default function Estadistica() {
  const [range, setRange] = useState()
  const [estadisticas, setEstadisticas] = useState(emptyStats)
  const [loading, setLoading] = useState(false)

  const propietarioData = useMemo(
    () => buildChartData(estadisticas.hectareas_por_propietario, 'nombre_estancia'),
    [estadisticas]
  )
  const maquinistaData = useMemo(
    () => buildChartData(estadisticas.hectareas_por_maquinista, 'maquinista'),
    [estadisticas]
  )
  const cultivoData = useMemo(
    () => buildChartData(estadisticas.hectareas_por_cultivo, 'cultivo'),
    [estadisticas]
  )

  const hasRange = Boolean(range?.from && range?.to)
  const hasCharts = propietarioData.length || maquinistaData.length || cultivoData.length

  const rangeLabel = useMemo(() => {
    if (!range?.from) return 'Seleccionar rango'
    if (!range?.to) return formatDisplayDate(range.from)
    return `${formatDisplayDate(range.from)} - ${formatDisplayDate(range.to)}`
  }, [range])

  useEffect(() => {
    if (!range?.from || !range?.to) return

    const fechaDesde = formatApiDate(range.from)
    const fechaHasta = formatApiDate(range.to)
    let active = true

    const fetchStats = async () => {
      setLoading(true)
      try {
        const data = await getEstadisticas({ fechaDesde, fechaHasta })
        if (!active) return
        setEstadisticas({
          hectareas_por_propietario: normalizeList(data?.hectareas_por_propietario),
          hectareas_por_maquinista: normalizeList(data?.hectareas_por_maquinista),
          hectareas_por_cultivo: normalizeList(data?.hectareas_por_cultivo),
        })
      } catch {
        if (active) {
          setEstadisticas(emptyStats)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    fetchStats()

    return () => {
      active = false
    }
  }, [range])

  const handleMesActual = () => {
    const today = new Date()
    setRange({
      from: startOfMonth(today),
      to: endOfMonth(today),
    })
  }

  const handleMesAnterior = () => {
    const previousMonth = subMonths(new Date(), 1)
    setRange({
      from: startOfMonth(previousMonth),
      to: endOfMonth(previousMonth),
    })
  }

  const handleRangoHistorico = () => {
    setRange({
      from: new Date(2025, 9, 1),
      to: new Date(2026, 2, 31),
    })
  }

  const formatAxisValue = (value) => {
    const parsed = Number(value)
    if (Number.isNaN(parsed)) return value
    return parsed.toLocaleString('es-AR')
  }

  return (
    <div className="p-4 space-y-4">
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

      {loading && (
        <div className="text-sm text-muted-foreground">Cargando estadísticas...</div>
      )}

      {!loading && !hasRange && (
        <div className="text-sm text-muted-foreground">
          Selecciona un rango para ver estadísticas.
        </div>
      )}

      {!loading && hasRange && !hasCharts && (
        <div className="text-sm text-muted-foreground">
          No hay estadísticas para el rango seleccionado.
        </div>
      )}

      {!loading && hasCharts && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Hectáreas por propietario</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={createChartConfig('--chart-1')}
                className="h-[300px] w-full"
              >
                <BarChart data={propietarioData} layout="vertical" margin={{ left: 24, right: 16 }}>
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                  <YAxis
                    dataKey="label"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    width={140}
                  />
                  <XAxis
                    dataKey="hectareas"
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={formatAxisValue}
                  />
                  <ChartTooltip content={<ChartTooltipContent valueFormatter={formatHectareas} />} />
                  <Bar dataKey="hectareas" fill="var(--color-hectareas)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hectáreas por maquinista</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={createChartConfig('--chart-2')}
                className="h-[300px] w-full"
              >
                <BarChart data={maquinistaData} layout="vertical" margin={{ left: 24, right: 16 }}>
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                  <YAxis
                    dataKey="label"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    width={140}
                  />
                  <XAxis
                    dataKey="hectareas"
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={formatAxisValue}
                  />
                  <ChartTooltip content={<ChartTooltipContent valueFormatter={formatHectareas} />} />
                  <Bar dataKey="hectareas" fill="var(--color-hectareas)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hectáreas por cultivo</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={createChartConfig('--chart-3')}
                className="h-[300px] w-full"
              >
                <BarChart data={cultivoData} layout="vertical" margin={{ left: 24, right: 16 }}>
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                  <YAxis
                    dataKey="label"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    width={140}
                  />
                  <XAxis
                    dataKey="hectareas"
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={formatAxisValue}
                  />
                  <ChartTooltip content={<ChartTooltipContent valueFormatter={formatHectareas} />} />
                  <Bar dataKey="hectareas" fill="var(--color-hectareas)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
