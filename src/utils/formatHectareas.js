const parseHectareas = (value) => {
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

const formatHectareas = (value) => {
  const numericValue = parseHectareas(value)
  if (numericValue === null) return 'Sin datos'
  if (Number.isInteger(numericValue)) {
    return numericValue.toLocaleString('es-AR', { maximumFractionDigits: 0 })
  }
  return numericValue.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export default formatHectareas
