import type { LoteFormValues } from '@/features/lotes/schemas/loteSchema'

type MapLoteFormValuesToFormDataOptions = {
  includeAdjuntos?: boolean
}

export const mapLoteFormValuesToFormData = (
  values: LoteFormValues,
  options: MapLoteFormValuesToFormDataOptions = {},
): FormData => {
  const formData = new FormData()

  Object.entries(values).forEach(([key, value]) => {
    if (key === 'adjuntos') {
      if (!options.includeAdjuntos || !(value instanceof FileList)) return

      Array.from(value).forEach((file) => {
        formData.append('lote[adjuntos][]', file)
      })

      return
    }

    formData.append(`lote[${key}]`, String(value ?? ''))
  })

  return formData
}
