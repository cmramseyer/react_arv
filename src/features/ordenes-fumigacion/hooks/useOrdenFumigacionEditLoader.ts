import { useMemo } from 'react'
import { useOrdenFumigacionQuery } from './useOrdenFumigacionQuery'
import { useEstanciasQuery } from '@/features/estancias/hooks/useEstanciaQuery'
import { useProductosQuery } from '@/features/productos/hooks/useProductoQuery'
import { useCultivosQuery } from '@/features/cultivos/hooks/useCultivoQuery'
import { useLotesByEstanciaQuery } from '@/features/lotes/hooks/useLoteQuery'
import { ordenToForm } from '../mappers/ordenToForm'

import { OrdenFumigacionId } from '@/features/ordenes-fumigacion/types'
import { OrdenFumigacionFormValues } from '@/features/ordenes-fumigacion/schemas/ordenFumigacionSchema'
import { Estancia } from '@/features/estancias/types'
import { Producto } from '@/features/productos/types'
import { Cultivo } from '@/features/cultivos/types'
import { Lote } from '@/features/lotes/types'
import { MaybeEntityId } from '@/utils/types'

type EditLoaderResponse = {
  isReady: boolean,
  isLoading: boolean,
  error: Error | null,
  initialValues: OrdenFumigacionFormValues | null,
  options: {
    estancias: Estancia[],
    productos: Producto[],
    cultivos: Cultivo[],
    lotes: Lote[]
  },
  queries: {
    ordenFumigacionQuery: ReturnType<typeof useOrdenFumigacionQuery>,
    estanciasQuery: ReturnType<typeof useEstanciasQuery>,
    productosQuery: ReturnType<typeof useProductosQuery>,
    cultivosQuery: ReturnType<typeof useCultivosQuery>,
    lotesQuery: ReturnType<typeof useLotesByEstanciaQuery>

  }
}

export function useOrdenFumigacionEditLoader(ordenId: MaybeEntityId): EditLoaderResponse {
  const ordenFumigacionQuery = useOrdenFumigacionQuery(ordenId, Boolean(ordenId))
  const estanciasQuery = useEstanciasQuery()
  const productosQuery = useProductosQuery()
  const cultivosQuery = useCultivosQuery()

  const estanciaId = ordenFumigacionQuery.data?.estancia_id
  const lotesQuery = useLotesByEstanciaQuery(estanciaId, Boolean(estanciaId))

  const isReady = Boolean(
    ordenFumigacionQuery.data &&
    estanciasQuery.data &&
    productosQuery.data &&
    cultivosQuery.data &&
    lotesQuery.data,
  )

  const initialValues = useMemo(() => {
    if (!isReady || !ordenFumigacionQuery.data) return null
    return ordenToForm(ordenFumigacionQuery.data)
  }, [isReady, ordenFumigacionQuery.data])

  return {
    isReady,
    isLoading:
      ordenFumigacionQuery.isLoading ||
      estanciasQuery.isLoading ||
      productosQuery.isLoading ||
      cultivosQuery.isLoading ||
      lotesQuery.isLoading,
    error:
      ordenFumigacionQuery.error ||
      estanciasQuery.error ||
      productosQuery.error ||
      cultivosQuery.error ||
      lotesQuery.error,
    initialValues,
    options: {
      estancias: estanciasQuery.data || [],
      productos: productosQuery.data || [],
      cultivos: cultivosQuery.data || [],
      lotes: lotesQuery.data || [],
    },
    queries: {
      ordenFumigacionQuery,
      estanciasQuery,
      productosQuery,
      cultivosQuery,
      lotesQuery,
    },
  }
}
