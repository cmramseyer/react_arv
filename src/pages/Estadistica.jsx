import React, { useEffect, useMemo, useState } from 'react'
import { endOfMonth, format, startOfMonth, subMonths } from 'date-fns'
import { getEstadisticas } from '../services/estadisticasService'

import EstadisticaFilter from '../components/EstadisticaFilter'
import EstadisticaCard from '../components/EstadisticaCard'

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

  

  return (
    <div className="p-4 space-y-4">
      
      <EstadisticaFilter
        handleMesActual={handleMesActual}
        handleMesAnterior={handleMesAnterior}
        handleRangoHistorico={handleRangoHistorico}
        range={range}
        setRange={setRange}
        rangeLabel={rangeLabel}
      />

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
          <EstadisticaCard
            title="Hectáreas por propietario"
            data={propietarioData}
            dataKey="hectareas"
            chart="1"
          />

          <EstadisticaCard
            title="Hectáreas por maquinista"
            data={maquinistaData}
            dataKey="hectareas"
            chart="2"
          />

          <EstadisticaCard
            title="Hectáreas por cultivo"
            data={cultivoData}
            dataKey="hectareas"
            chart="3"
          />

        </div>
      )}
    </div>
  )
}
