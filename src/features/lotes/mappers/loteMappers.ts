import type { LoteFormValues } from '@/features/lotes/schemas/loteSchema'

export const mapLoteFormValuesToFormData = (
  values: LoteFormValues,
): FormData => {
  const formData = new FormData()

  Object.entries(values).forEach(([key, value]) => {
    formData.append(`lote[${key}]`, String(value ?? ''))
  })

  return formData
}
