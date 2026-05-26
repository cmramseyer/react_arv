export const parseHectareas = (value) => {
  if (value === null || value === undefined || value === '') return null
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return null
    const normalized = trimmed.includes(',') && !trimmed.includes('.')
      ? trimmed.replace(',', '.')
      : trimmed
    const numericValue = Number(normalized)
    return Number.isNaN(numericValue) ? null : numericValue
  }
  const numericValue = Number(value)
  return Number.isNaN(numericValue) ? null : numericValue
}

export const formatHectareas = (value) => {
  const numericValue = parseHectareas(value)
  if (numericValue === null) return 'Sin datos'
  const formattedValue = Number.isInteger(numericValue)
    ? numericValue.toLocaleString('es-AR', { maximumFractionDigits: 0 })
    : numericValue.toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  return `${formattedValue} ha`
}

export const getTotalHectareas = (selectedLotes, lotesDisponibles) => {
  if (!Array.isArray(selectedLotes) || !Array.isArray(lotesDisponibles)) return 0
  const lotesById = new Map(lotesDisponibles.map((lote) => [String(lote.id), lote]))

  return selectedLotes.reduce((acc, lote) => {
    if (!lote?.lote_id) return acc
    const hectareasRealesValue = parseHectareasValue(lote.hectareas_reales)
    if (hectareasRealesValue !== null) {
      return acc + hectareasRealesValue
    }
    const loteData = lotesById.get(String(lote.lote_id))
    if (!loteData) return acc
    const hectareasValue = parseHectareasValue(loteData.hectareas)
    if (hectareasValue === null) return acc
    return acc + hectareasValue
  }, 0)
}

export const parseHectareasValue = (value) => {
  if (value === null || value === undefined || value === '') return null
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return null
    const normalized = trimmed.includes(',') && !trimmed.includes('.')
      ? trimmed.replace(',', '.')
      : trimmed
    const numericValue = Number(normalized)
    return Number.isNaN(numericValue) ? null : numericValue
  }
  const numericValue = Number(value)
  return Number.isNaN(numericValue) ? null : numericValue
}