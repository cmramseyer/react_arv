import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'

vi.mock('../services/maquinistasService', () => ({
  getMaquinista: vi.fn(),
  updateMaquinista: vi.fn(),
}))

import { getMaquinista, updateMaquinista } from '../services/maquinistasService'
import MaquinistaEditar from './MaquinistaEdit'

const maquinistaFixture = { id: 1, nombre: 'Pedro' }

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

describe('MaquinistaEditar', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
    getMaquinista.mockResolvedValueOnce(maquinistaFixture)
  })

  it('returns to Maquinistas without extra requests when clicking Volver', async () => {
    render(
      <MemoryRouter initialEntries={['/maquinistas', '/maquinistas/1/editar']} initialIndex={1}>
        <Routes>
          <Route path="/maquinistas" element={<div>Maquinistas Page</div>} />
          <Route path="/maquinistas/:id/editar" element={<MaquinistaEditar />} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>
    )

    await screen.findByDisplayValue('Pedro')

    const getMaquinistaCalls = getMaquinista.mock.calls.length

    await user.click(screen.getByRole('button', { name: /volver/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/maquinistas')
    expect(updateMaquinista).not.toHaveBeenCalled()
    await waitFor(() => {
      expect(getMaquinista).toHaveBeenCalledTimes(getMaquinistaCalls)
    })
  })
})
