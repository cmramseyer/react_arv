import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'

vi.mock('../services/cultivosService', () => ({
  createCultivo: vi.fn(),
}))

import { createCultivo } from '../services/cultivosService'
import CultivoNueva from './CultivoNueva'

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

describe('CultivoNueva', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
    createCultivo.mockClear()
  })

  it('returns to Cultivos without extra requests when clicking Volver', async () => {
    render(
      <MemoryRouter initialEntries={['/cultivos', '/cultivos/nuevo']} initialIndex={1}>
        <Routes>
          <Route path="/cultivos" element={<div>Cultivos Page</div>} />
          <Route path="/cultivos/nuevo" element={<CultivoNueva />} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>
    )

    await user.click(screen.getByRole('button', { name: /volver/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/cultivos')
    expect(createCultivo).not.toHaveBeenCalled()
  })
})
