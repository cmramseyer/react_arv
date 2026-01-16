// Polyfill para TextEncoder en Vitest
import { TextEncoder, TextDecoder } from 'util'
import '@testing-library/jest-dom'

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder
}

globalThis.mockImportMetaEnv = (overrides = {}) => {
  const viteUrl = overrides.VITE_API_URL || import.meta.env?.VITE_API_URL || 'localhost:3000'
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
