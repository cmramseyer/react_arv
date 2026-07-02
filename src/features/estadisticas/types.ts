export type EstadisticasFilters = {
  fechaDesde?: string | null
  fechaHasta?: string | null
}

export type EstadisticaHectareasPorPropietario = {
  nombre_estancia: string
  hectareas: number | string
}

export type EstadisticaHectareasPorMaquinista = {
  maquinista: string
  hectareas: number | string
}

export type EstadisticaHectareasPorCultivo = {
  cultivo: string
  hectareas: number | string
}

export type Estadisticas = {
  hectareas_por_propietario: EstadisticaHectareasPorPropietario[]
  hectareas_por_maquinista: EstadisticaHectareasPorMaquinista[]
  hectareas_por_cultivo: EstadisticaHectareasPorCultivo[]
}

export type LabelHectareasChart = {
  label: string,
  hectareas: number
}