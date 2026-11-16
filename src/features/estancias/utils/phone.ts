import { formatIncompletePhoneNumber } from 'libphonenumber-js'

export const ESTANCIA_PHONE_DIGITS = 10

// Keeps only digits so masked and raw values can be compared or submitted.
export const normalizeEstanciaPhone = (value: string | null | undefined): string =>
  (value ?? '').replace(/\D/g, '')

// Removes every non-digit as the user types and rejects digits beyond the limit.
export const maskEstanciaPhone = (value: string | null | undefined): string => {
  const digits = normalizeEstanciaPhone(value).slice(0, ESTANCIA_PHONE_DIGITS)
  if (!digits) return ''

  const national = formatIncompletePhoneNumber(digits, 'AR')
  const areaCodeEnd = national.indexOf(' ')

  // libphonenumber-js separates the area code with a space; the form shows it in parentheses.
  return areaCodeEnd === -1
    ? national
    : `(${national.slice(0, areaCodeEnd)}) ${national.slice(areaCodeEnd + 1)}`
}

// Formats a stored number for display without truncating legacy invalid values.
export const displayEstanciaPhone = (value: string | null | undefined): string => {
  const digits = normalizeEstanciaPhone(value)
  return digits.length === ESTANCIA_PHONE_DIGITS ? maskEstanciaPhone(digits) : (value ?? '')
}

// Empty is valid; any other value must contain exactly ten national digits.
export const isValidEstanciaPhone = (value: string | null | undefined): boolean => {
  const digits = normalizeEstanciaPhone(value)
  return digits.length === 0 || digits.length === ESTANCIA_PHONE_DIGITS
}
