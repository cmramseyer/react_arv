import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { getMaquinistas, getMaquinista, createMaquinista, updateMaquinista, deleteMaquinista } from '@/features/maquinistas/api/maquinistasService'

export const maquinistasQueryKey = () => ['maquinistas']
export const maquinistaQueryKey = (id) => ['maquinista', id]

export const useMaquinistasQuery = () => {
  return useQuery({
    queryKey: maquinistasQueryKey(),
    queryFn: getMaquinistas
  })
}

export const useMaquinistaQuery = (id, enabled = true) => {
  return useQuery({
    queryKey: maquinistaQueryKey(id),
    queryFn: () => getMaquinista(id),
    enabled: Boolean(id) && enabled
  })
}

export const useMaquinistaMutation = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (data) => createMaquinista(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: maquinistasQueryKey()})
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({id, data}) => updateMaquinista(id, data),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({queryKey: maquinistasQueryKey()})
      await queryClient.invalidateQueries({queryKey: maquinistaQueryKey(variables.id)})
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteMaquinista(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: maquinistasQueryKey()})
    }
  })

  return { createMutation, updateMutation, deleteMutation }
}

