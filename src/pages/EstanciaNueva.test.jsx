import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'

vi.mock('../services/estanciasService', () => ({
  createEstancia: vi.fn(),
}))

import { createEstancia } from '../services/estanciasService'
import EstanciaNueva from './EstanciaNueva'

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

describe('EstanciaNueva', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
    createEstancia.mockClear()
  })

  it('returns to Estancias without extra requests when clicking Volver', async () => {
    render(
      <MemoryRouter initialEntries={['/estancias', '/estancias/nueva']} initialIndex={1}>
        <Routes>
          <Route path="/estancias" element={<div>Estancias Page</div>} />
          <Route path="/estancias/nueva" element={<EstanciaNueva />} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>
    )

    await user.click(screen.getByRole('button', { name: /volver/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/estancias')
    expect(createEstancia).not.toHaveBeenCalled()
  })
})
