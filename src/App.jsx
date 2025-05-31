import { React } from 'react'
import { Link, Outlet } from 'react-router-dom'
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
                Building Your Application
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
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
