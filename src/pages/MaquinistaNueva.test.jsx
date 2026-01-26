import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'

vi.mock('../services/maquinistasService', () => ({
  createMaquinista: vi.fn(),
}))

import { createMaquinista } from '../services/maquinistasService'
import MaquinistaNueva from './MaquinistaNueva'

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

describe('MaquinistaNueva', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
    createMaquinista.mockClear()
  })

  it('returns to Maquinistas without extra requests when clicking Volver', async () => {
    render(
      <MemoryRouter initialEntries={['/maquinistas', '/maquinistas/nuevo']} initialIndex={1}>
        <Routes>
          <Route path="/maquinistas" element={<div>Maquinistas Page</div>} />
          <Route path="/maquinistas/nuevo" element={<MaquinistaNueva />} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>
    )

    await user.click(screen.getByRole('button', { name: /volver/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/maquinistas')
    expect(createMaquinista).not.toHaveBeenCalled()
  })
})
