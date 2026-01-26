import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'

vi.mock('../services/cultivosService', () => ({
  getCultivo: vi.fn(),
  updateCultivo: vi.fn(),
}))

import { getCultivo, updateCultivo } from '../services/cultivosService'
import CultivoEditar from './CultivoEditar'

const cultivoFixture = { id: 1, nombre: 'Trigo' }

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

describe('CultivoEditar', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
    getCultivo.mockResolvedValueOnce(cultivoFixture)
  })

  it('returns to Cultivos without extra requests when clicking Volver', async () => {
    render(
      <MemoryRouter initialEntries={['/cultivos', '/cultivos/1/editar']} initialIndex={1}>
        <Routes>
          <Route path="/cultivos" element={<div>Cultivos Page</div>} />
          <Route path="/cultivos/:id/editar" element={<CultivoEditar />} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>
    )

    await screen.findByDisplayValue('Trigo')

    const getCultivoCalls = getCultivo.mock.calls.length

    await user.click(screen.getByRole('button', { name: /volver/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/cultivos')
    expect(updateCultivo).not.toHaveBeenCalled()
    await waitFor(() => {
      expect(getCultivo).toHaveBeenCalledTimes(getCultivoCalls)
    })
  })
})
