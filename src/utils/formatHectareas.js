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


export const formatDate = (value) => {
  if (!value) return 'Sin fecha'
  const dateString = String(value)
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) return dateString
  const isoMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!isoMatch) return 'Sin fecha'
  const [, year, month, day] = isoMatch
  return `${day}/${month}/${year}`
}

export const joinWith = (string1, string2, separator) => {
  const left = string1 ? String(string1) : 'Sin datos'
  const right = string2 ? String(string2) : 'Sin datos'
  return `${left} ${separator} ${right}`
}