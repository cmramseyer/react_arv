import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { getMaquinistas, getMaquinista, createMaquinista, updateMaquinista, deleteMaquinista } from '@/features/maquinistas/api/maquinistasService'

import type { Maquinista } from '@/features/maquinistas/types'
import type { MaquinistaFormValues } from '@/features/maquinistas/schemas/maquinistaSchema'

type UpdateMaquinistaMutationFormValues = {
  id: number | string,
  payload: MaquinistaFormValues
}

export const maquinistasQueryKey = () => ['maquinistas'] as const
export const maquinistaQueryKey = (id: number | string) => ['maquinista', id] as const

export const useMaquinistasQuery = () => {
  return useQuery<Maquinista[]>({
    queryKey: maquinistasQueryKey(),
    queryFn: getMaquinistas
  })
}

export const useMaquinistaQuery = (id: number | string, enabled = true) => {
  return useQuery<Maquinista>({
    queryKey: maquinistaQueryKey(id),
    queryFn: () => getMaquinista(id),
    enabled: Boolean(id) && enabled
  })
}

export const useMaquinistaMutation = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation<Maquinista, Error, MaquinistaFormValues>({
    mutationFn: (data) => createMaquinista(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: maquinistasQueryKey()})
    }
  })

  const updateMutation = useMutation<Maquinista, Error, UpdateMaquinistaMutationFormValues>({
    mutationFn: ({id, payload}) => updateMaquinista(id, payload),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({queryKey: maquinistasQueryKey()})
      await queryClient.invalidateQueries({queryKey: maquinistaQueryKey(variables.id)})
    }
  })

  const deleteMutation = useMutation<null, Error, number | string>({
    mutationFn: (id) => deleteMaquinista(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: maquinistasQueryKey()})
    }
  })

  return { createMutation, updateMutation, deleteMutation }
}

