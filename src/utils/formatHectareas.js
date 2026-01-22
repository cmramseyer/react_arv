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
  const formattedValue = Number.isInteger(numericValue)
    ? numericValue.toLocaleString('es-AR', { maximumFractionDigits: 0 })
    : numericValue.toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  return `${formattedValue} ha`
}

export default formatHectareas
