import { useQuery } from '@tanstack/react-query'
import { getEstadisticas } from '../api/estadisticasService'

import { Estadisticas, EstadisticasFilters } from '../types'

export const useEstadisticasQuery = ( {fechaDesde, fechaHasta}: EstadisticasFilters, enabled = true) => {

  return useQuery<Estadisticas>({
    queryKey: ['estadisticas', { fechaDesde, fechaHasta }],
    queryFn: () => getEstadisticas({ fechaDesde, fechaHasta }),
    enabled: !!fechaDesde && !!fechaHasta && enabled
  })
}