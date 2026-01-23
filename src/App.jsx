import { React, useMemo } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import { AppSidebar } from './components/AppSidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"


export default function App() {
  const { isAuthenticated, logout } = useAuth()
  const location = useLocation()

  const pageTitle = useMemo(() => {
    if (location.pathname.startsWith('/lotes')) return 'Lotes'
    if (location.pathname.startsWith('/estancias')) return 'Estancias'
    if (location.pathname.startsWith('/cultivos')) return 'Cultivos'
    if (location.pathname.startsWith('/maquinistas')) return 'Maquinistas'
    if (location.pathname.startsWith('/productos')) return 'Productos'
    if (location.pathname.startsWith('/estadisticas')) return 'Estadisticas'
    if (location.pathname.startsWith('/ordenes')) return 'Ordenes'
    if (location.pathname === '/' || location.pathname === '/home') return 'Inicio'
    return 'Página'
  }, [location.pathname])

  const authButton = isAuthenticated ? (
    <button onClick={logout} className="text-sm text-red-500 hover:text-red-700 ml-4">
      Sign Out
    </button>
  ) : (
    <Link to="/login" className="text-sm text-green-500 hover:text-green-700 ml-4">
      Login
    </Link>
  )

  return (
    <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#">
                ARV
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
          <Outlet/>
        </div>
        
      </div>
    </SidebarInset>
  </SidebarProvider>

  )
}
