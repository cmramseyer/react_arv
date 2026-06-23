import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { getProductos, getProducto, createProducto, updateProducto, deleteProducto } from '@/features/productos/api/productosService'

import type { Producto } from '@/features/productos/types'
import type { ProductoFormValues } from '@/features/productos/schemas/productoSchema'

type UpdateProductoMutationVariables = {
  id: number | string
  payload: ProductoFormValues
}

export const productosQueryKey = () => ['productos'] as const
export const productoQueryKey = (id: number | string) => ['producto', id] as const

export const useProductosQuery = () => {
  return useQuery<Producto[]>({
    queryKey: productosQueryKey(),
    queryFn: getProductos
  })
}

export const useProductoQuery = (id: number | string, enabled = true) => {
  return useQuery<Producto>({
    queryKey: productoQueryKey(id),
    queryFn: () => getProducto(id),
    enabled: Boolean(id) && enabled
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

  const deleteMutation = useMutation<null, Error, number | string>({
    mutationFn: (id) => deleteProducto(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: productosQueryKey()})
    }
  })

  return { updateMutation, createMutation, deleteMutation }
}
