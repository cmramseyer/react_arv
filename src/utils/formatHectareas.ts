type HectareasFormInput = number | string | null | undefined
type ImporteFormInput = number | string | null | undefined
type DateFormInput = string | null | undefined
type ParsedImporte = number | null
type ParsedHectareas = number | null

type SelectedLotes = { 
  lote_id?: string | number,
  nombre_manual?: string,
  hectareas_reales?: number | string | null
}

type LotesDisponibles = {
  id: string | number,
  hectareas?: number | string | null
}

type JoinString = string | null | undefined

// Parses hectare values from numbers or localized strings.
export const parseHectareas = (value: HectareasFormInput): ParsedHectareas => {
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

// Formats hectares for display with the AR locale and unit suffix.
export const formatHectareas = (value: HectareasFormInput): string => {
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

// Sums selected lot hectares using actual hectares when available.
export const getTotalHectareas = (selectedLotes: SelectedLotes[] | null | undefined, lotesDisponibles: LotesDisponibles[] | null | undefined): number => {
  if (!Array.isArray(selectedLotes) || !Array.isArray(lotesDisponibles)) return 0
  const lotesById = new Map(lotesDisponibles.map((lote) => [String(lote.id), lote]))

  return selectedLotes.reduce((acc, lote) => {
    if (lote?.nombre_manual) {
      return acc + (parseHectareasValue(lote.hectareas_reales) ?? 0)
    }
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

// Parses raw hectare values into numbers or null.
export const parseHectareasValue = (value: HectareasFormInput): ParsedHectareas => {
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

// Formats ISO-like dates into dd/mm/yyyy display format.
export const formatDate = (value: DateFormInput): string => {
  if (!value) return 'Sin fecha'
  const dateString = String(value)
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) return dateString
  const isoMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!isoMatch) return 'Sin fecha'
  const [, year, month, day] = isoMatch
  return `${day}/${month}/${year}`
}

// Joins two display values with a separator, using fallbacks.
export const joinWith = (string1: JoinString, string2: JoinString, separator: string) => {
  const left = string1 ? String(string1) : 'Sin datos'
  const right = string2 ? String(string2) : 'Sin datos'
  return `${left} ${separator} ${right}`
}

// Validates AR decimal currency input with exactly two decimals.
export const importeEsValido = (importe: string): boolean => /^\d+,\d{2}$/.test(importe)

// Parses localized amount strings into numeric values.
export const parseImporte = (importe: ImporteFormInput): ParsedImporte => {
  if (importe === null || importe === undefined) return null
  const raw = String(importe).trim()
  if (raw === '') return null

  let normalized = raw
  if (raw.includes(',') && raw.includes('.')) {
    normalized = raw.replace(/\./g, '').replace(',', '.')
  } else if (raw.includes(',')) {
    normalized = raw.replace(',', '.')
  }

  const numero = Number(normalized)
  if (Number.isNaN(numero)) return null

  return numero
}

// Formats amounts as ARS currency without spacing.
export const formatImporte = (importe: ImporteFormInput): string => {
  const numero = parseImporte(importe)
  if (numero === null) return ''

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(numero)
    .replace(/\s/g, '')
}
