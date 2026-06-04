import { useQueryClient, useQuery } from '@tanstack/react-query'
import { getEstadisticas } from '../api/estadisticasService'

export const useEstadisticasQuery = ( fechaDesde, fechaHasta, enabled = true) => {

  return useQuery({
    queryKey: ['estadisticas', { fechaDesde, fechaHasta }],
    queryFn: () => getEstadisticas({ fechaDesde, fechaHasta }),
    enabled: !!fechaDesde && !!fechaHasta && enabled
  })
}