import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

import Estadistica from '@/features/estadisticas/pages/Estadistica'
import { apiUrl } from '@/services/apiUrl'

const estadisticasFixture = {
  hectareas_por_propietario: [{ nombre_estancia: 'Estancia Uno', hectareas: 10 }],
  hectareas_por_maquinista: [{ maquinista: 'Pedro', hectareas: 10 }],
  hectareas_por_cultivo: [{ cultivo: 'Trigo', hectareas: 10 }],
}

const server = setupServer(
  http.get(apiUrl('estadisticas'), async () => {
    await new Promise((resolve) => setTimeout(resolve, 50))
    return HttpResponse.json(estadisticasFixture)
  })
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
})
afterAll(() => server.close())

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

const renderEstadistica = () => {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter initialEntries={['/estadisticas']}>
        <Routes>
          <Route path="/estadisticas" element={<Estadistica />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('Estadistica', () => {
  it('shows a skeleton while statistics are loading', async () => {
    const user = userEvent.setup()
    renderEstadistica()

    expect(screen.queryByRole('status', { name: /cargando estadísticas/i })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /mes actual/i }))

    expect(screen.getByRole('status', { name: /cargando estadísticas/i })).toBeInTheDocument()

    expect(await screen.findByText('Hectáreas por propietario')).toBeInTheDocument()
    expect(screen.getByText('Hectáreas por maquinista')).toBeInTheDocument()
    expect(screen.getByText('Hectáreas por cultivo')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByRole('status', { name: /cargando estadísticas/i })).not.toBeInTheDocument()
    })
  })
})
