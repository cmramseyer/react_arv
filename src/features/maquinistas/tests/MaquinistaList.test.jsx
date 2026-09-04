import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'

import MaquinistaList from '@/features/maquinistas/components/MaquinistaList'

const maquinistas = [
  { id: 1, nombre: 'Carlos' },
  { id: 2, nombre: 'Juan' },
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
        <MaquinistaList maquinistas={maquinistas} onEdit={onEdit} {...props} />
      </MemoryRouter>
    </QueryClientProvider>
  )

  return { onEdit }
}

describe('MaquinistaList', () => {
  it('renders maquinistas in the table', () => {
    renderList()

    expect(screen.getByText('Carlos')).toBeInTheDocument()
    expect(screen.getByText('Juan')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Nombre' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Acciones' })).toBeInTheDocument()
  })

  it('notifies the parent when clicking edit', async () => {
    const user = userEvent.setup()
    const { onEdit } = renderList()

    const carlosCell = screen.getByText('Carlos')
    const row = carlosCell.closest('tr')
    await user.click(within(row).getByRole('button', { name: /editar/i }))

    expect(onEdit).toHaveBeenCalledWith(1)
  })
})
