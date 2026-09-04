import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { AppSidebar } from './AppSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <Outlet />
    </SidebarProvider>
  )
}

const renderLayout = (initialEntries = ['/estancias']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/estancias" element={<div>Contenido Estancias</div>} />
          <Route path="/lotes" element={<div>Contenido Lotes</div>} />
          <Route path="/productos" element={<div>Contenido Productos</div>} />
        </Route>
      </Routes>
      <LocationDisplay />
    </MemoryRouter>
  )
}

describe('AppSidebar', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    })
  })

  it('navigates client-side keeping the sidebar mounted', async () => {
    const user = userEvent.setup()
    renderLayout()

    const sidebarHeader = screen.getByText('Sistema ARV')
    expect(sidebarHeader).toBeInTheDocument()
    expect(screen.getByText('Contenido Estancias')).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Lotes' }))

    expect(screen.getByTestId('location')).toHaveTextContent('/lotes')
    expect(screen.getByText('Contenido Lotes')).toBeInTheDocument()
    expect(screen.queryByText('Contenido Estancias')).not.toBeInTheDocument()
    expect(screen.getByText('Sistema ARV')).toBe(sidebarHeader)
  })

  it('navigates to collapsible submenu items without remounting the sidebar', async () => {
    const user = userEvent.setup()
    renderLayout()

    const sidebarHeader = screen.getByText('Sistema ARV')

    await user.click(screen.getByRole('link', { name: 'Productos' }))

    expect(screen.getByTestId('location')).toHaveTextContent('/productos')
    expect(screen.getByText('Contenido Productos')).toBeInTheDocument()
    expect(screen.getByText('Sistema ARV')).toBe(sidebarHeader)
  })
})
