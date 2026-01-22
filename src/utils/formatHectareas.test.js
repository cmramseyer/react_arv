import { describe, expect, it } from 'vitest'
import formatHectareas from './formatHectareas'

describe('formatHectareas', () => {
  it('returns Sin datos for empty values', () => {
    expect(formatHectareas(null)).toBe('Sin datos')
    expect(formatHectareas(undefined)).toBe('Sin datos')
    expect(formatHectareas('')).toBe('Sin datos')
    expect(formatHectareas('   ')).toBe('Sin datos')
  })

  it('formats integers without decimals', () => {
    expect(formatHectareas(55)).toBe('55')
    expect(formatHectareas(55.0)).toBe('55')
    expect(formatHectareas('55')).toBe('55')
  })

  it('formats decimals with two digits', () => {
    expect(formatHectareas(55.5)).toBe('55,50')
    expect(formatHectareas('55.5')).toBe('55,50')
    expect(formatHectareas('55,5')).toBe('55,50')
  })

  it('uses thousands separator for large numbers', () => {
    expect(formatHectareas(1000)).toBe('1.000')
    expect(formatHectareas(1000.2)).toBe('1.000,20')
  })
})
