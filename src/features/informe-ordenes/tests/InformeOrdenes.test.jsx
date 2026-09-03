import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

vi.mock('@/features/informe-ordenes/api/informeOrdenService', () => ({
  solicitarInformeOrden: vi.fn(),
}))

import InformeOrdenes from '@/features/informe-ordenes/pages/InformeOrdenes'
import { solicitarInformeOrden } from '@/features/informe-ordenes/api/informeOrdenService'

describe('InformeOrdenes', () => {
  const originalCreateObjectURL = URL.createObjectURL
  const originalRevokeObjectURL = URL.revokeObjectURL
  let windowOpen

  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => 'blob:informe-ordenes')
    URL.revokeObjectURL = vi.fn()
    windowOpen = vi.spyOn(window, 'open').mockImplementation(() => null)
  })

  afterEach(() => {
    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
    windowOpen.mockRestore()
  })

  it('requests and opens the report for the selected month and year', async () => {
    const user = userEvent.setup()
    solicitarInformeOrden.mockResolvedValueOnce(new Blob(['pdf'], { type: 'application/pdf' }))
    const today = new Date()

    render(<InformeOrdenes />)

    await user.click(screen.getByRole('button', { name: 'Generar informe' }))

    await waitFor(() => {
      expect(solicitarInformeOrden).toHaveBeenCalledWith({
        mes: today.getMonth() + 1,
        anio: today.getFullYear(),
      })
    })

    expect(URL.createObjectURL).toHaveBeenCalledTimes(1)
    expect(windowOpen).toHaveBeenCalledWith('blob:informe-ordenes', '_blank', 'noopener,noreferrer')
  })
})
