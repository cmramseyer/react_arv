import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'

import ProductoList from '../components/ProductoList'

const productos = [
  { id: 1, nombre: 'Roundup', tipo_producto: 'Agroquímico', unidad_medida: 'kg' },
  { id: 2, nombre: '2-4D', tipo_producto: 'Agroquímico', unidad_medida: 'litros' },
]

const renderList = (props = {}) => {
  const onEdit = vi.fn()
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ProductoList productos={productos} onEdit={onEdit} {...props} />
      </MemoryRouter>
    </QueryClientProvider>
  )

  return { onEdit }
}

describe('ProductoList', () => {
  it('renders products in the table', () => {
    renderList()

    expect(screen.getByText('Roundup')).toBeInTheDocument()
    expect(screen.getByText('2-4D')).toBeInTheDocument()
    expect(screen.getByText('litros')).toBeInTheDocument()
    expect(screen.getByText('kg')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Tipo' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Unidad' })).toBeInTheDocument()
  })

  it('notifies the parent when clicking edit', async () => {
    const user = userEvent.setup()
    const { onEdit } = renderList()

    const roundupCell = screen.getByText('Roundup')
    const row = roundupCell.closest('tr')
    await user.click(within(row).getByRole('button', { name: /editar/i }))

    expect(onEdit).toHaveBeenCalledWith(1)
  })
})
