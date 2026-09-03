import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'

vi.mock('@/features/lotes/api/lotesService', () => ({
  getLote: vi.fn(),
}))

import { getLote } from '@/features/lotes/api/lotesService'
import LoteShow from '@/features/lotes/pages/LoteShow'

const loteFixture = {
  id: 1,
  nombre: 'Lote Uno',
  lat: 10,
  long: 20,
  hectareas: 5,
  link_mapa: 'http://mapa.com',
  adjuntos: [],
}

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

describe('LoteShow', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
    vi.clearAllMocks()
    getLote.mockResolvedValueOnce(loteFixture)
  })

  it('returns to Lotes without extra requests when clicking Volver', async () => {
    render(
      <MemoryRouter initialEntries={['/lotes', '/lotes/1']} initialIndex={1}>
        <Routes>
          <Route path="/lotes" element={<div>Lotes Page</div>} />
          <Route path="/lotes/:id" element={<LoteShow />} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>
    )

    await screen.findByText('Lote Uno')

    const getLoteCalls = getLote.mock.calls.length

    await user.click(screen.getByRole('button', { name: /volver/i }))

    expect(screen.getByTestId('location')).toHaveTextContent('/lotes')
    await waitFor(() => {
      expect(getLote).toHaveBeenCalledTimes(getLoteCalls)
    })
  })
})
