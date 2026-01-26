import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'

vi.mock('../services/estanciasService', () => ({
  getEstancia: vi.fn(),
  updateEstancia: vi.fn(),
}))

import { getEstancia, updateEstancia } from '../services/estanciasService'
import EstanciaEditar from './EstanciaEditar'

const estanciaFixture = {
  id: 1,
  nombre: 'Estancia Uno',
  contacto: 'Juan',
  telefono: '123',
  email: 'test@example.com',
}

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

describe('EstanciaEditar', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
    getEstancia.mockResolvedValueOnce(estanciaFixture)
  })

  it('returns to Estancias without extra requests when clicking Volver', async () => {
    render(
      <MemoryRouter initialEntries={['/estancias', '/estancias/1/editar']} initialIndex={1}>
        <Routes>
          <Route path="/estancias" element={<div>Estancias Page</div>} />
          <Route path="/estancias/:id/editar" element={<EstanciaEditar />} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>
    )

    await screen.findByDisplayValue('Estancia Uno')

    const getEstanciaCalls = getEstancia.mock.calls.length

    await user.click(screen.getByRole('button', { name: /volver/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/estancias')
    expect(updateEstancia).not.toHaveBeenCalled()
    await waitFor(() => {
      expect(getEstancia).toHaveBeenCalledTimes(getEstanciaCalls)
    })
  })
})
