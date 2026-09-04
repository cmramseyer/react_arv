import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'

import CultivoList from '@/features/cultivos/components/CultivoList'

const cultivos = [
  { id: 1, nombre: 'Soja' },
  { id: 2, nombre: 'Trigo' },
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
        <CultivoList cultivos={cultivos} onEdit={onEdit} {...props} />
      </MemoryRouter>
    </QueryClientProvider>
  )

  return { onEdit }
}

describe('CultivoList', () => {
  it('renders cultivos in the table', () => {
    renderList()

    expect(screen.getByText('Soja')).toBeInTheDocument()
    expect(screen.getByText('Trigo')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Nombre' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Acciones' })).toBeInTheDocument()
  })

  it('notifies the parent when clicking edit', async () => {
    const user = userEvent.setup()
    const { onEdit } = renderList()

    const sojaCell = screen.getByText('Soja')
    const row = sojaCell.closest('tr')
    await user.click(within(row).getByRole('button', { name: /editar/i }))

    expect(onEdit).toHaveBeenCalledWith(1)
  })
})
