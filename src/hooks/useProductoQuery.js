import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { getProductos, getProducto, createProducto, updateProducto, deleteProducto } from '@/services/productosService'

export const productosQueryKey = () => ['productos']
export const productoQueryKey = (id) => ['producto', id]

export const useProductosQuery = () => {
  return useQuery({
    queryKey: productosQueryKey(),
    queryFn: getProductos
  })
}

export const useProductoQuery = (id, enabled = true) => {
  return useQuery({
    queryKey: productoQueryKey(id),
    queryFn: () => getProducto(id),
    enabled: Boolean(id) && enabled
  })
}

export const useProductosMutation = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (payload) => createProducto(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: productosQueryKey()})
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({id, payload}) => updateProducto(id, payload),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({queryKey: productoQueryKey(variables.id)})
      await queryClient.invalidateQueries({queryKey: productosQueryKey()})
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteProducto(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: productosQueryKey()})
    }
  })

  return { updateMutation, createMutation, deleteMutation }
}
