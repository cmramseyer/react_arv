import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { getProductos, getProducto, createProducto, updateProducto, deleteProducto } from '@/features/productos/api/productosService'

import type { Producto } from '@/features/productos/types'
import type { ProductoFormValues } from '@/features/productos/schemas/productoSchema'

import type { EntityId, MaybeEntityId } from '@/utils/types'
import { hasId } from '@/utils/types'

type UpdateProductoMutationVariables = {
  id: EntityId,
  payload: ProductoFormValues
}

export const productosQueryKey = () => ['productos'] as const
export const productoQueryKey = (id: EntityId) => ['producto', id] as const

export const useProductosQuery = () => {
  return useQuery<Producto[]>({
    queryKey: productosQueryKey(),
    queryFn: getProductos
  })
}

export const useProductoQuery = (id: MaybeEntityId, enabled = true) => {
  const queryEnabled = hasId(id) && enabled
  return useQuery<Producto>({
    queryKey: ['producto', id ?? null] as const,
    queryFn: () => {
      if(!hasId(id)) {
        throw new Error('useProductoQuery requires id')
      }
      return getProducto(id)
    },
    enabled: queryEnabled
  })
}

export const useProductosMutation = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation<Producto, Error, ProductoFormValues>({
    mutationFn: (payload) => createProducto(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: productosQueryKey()})
    }
  })

  const updateMutation = useMutation<Producto, Error, UpdateProductoMutationVariables>({
    mutationFn: ({id, payload}) => updateProducto(id, payload),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({queryKey: productoQueryKey(variables.id)})
      await queryClient.invalidateQueries({queryKey: productosQueryKey()})
    }
  })

  const deleteMutation = useMutation<null, Error, EntityId>({
    mutationFn: (id) => deleteProducto(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: productosQueryKey()})
    }
  })

  return { updateMutation, createMutation, deleteMutation }
}
