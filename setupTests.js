// Polyfill para TextEncoder en Vitest
import { TextEncoder, TextDecoder } from 'util'
import '@testing-library/jest-dom'
import { setCsrfToken } from './src/services/csrfService'

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder
}

// Mock hasPointerCapture for jsdom compatibility with Radix UI
Object.defineProperty(window.Element.prototype, 'hasPointerCapture', {
  writable: true,
  value: vi.fn().mockImplementation(() => false),
})

// Mock scrollIntoView for jsdom compatibility with Radix UI
Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
  writable: true,
  value: vi.fn(),
})

if (typeof window.ResizeObserver === 'undefined') {
  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

globalThis.mockImportMetaEnv = (overrides = {}) => {
  const viteUrl = overrides.VITE_API_URL || import.meta.env?.VITE_API_URL || 'http://localhost:3000'
  if (!import.meta.env) {
    Object.defineProperty(import.meta, 'env', {
      value: { VITE_API_URL: viteUrl },
      writable: true,
    })
  } else if (!import.meta.env.VITE_API_URL) {
    import.meta.env.VITE_API_URL = viteUrl
  }
  return import.meta.env
}

globalThis.mockImportMetaEnv()
setCsrfToken('test-csrf-token')
