import * as React from "react"
import { ChevronDown } from "lucide-react"
import { useLocation } from "react-router-dom"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  versions: [],
  navMain: [
    {
      title: "Menu",
      url: "#",
      items: [
        {
          title: "Estancias",
          url: "/estancias",
        },
        {
          title: "Lotes",
          url: "/lotes",
        },
        {
          title: "Ordenes",
          url: "/ordenes_fumigacion",
        },
        {
          title: "Buscar órdenes",
          url: "/buscar_ordenes",
        },
        {
          title: "Facturación",
          url: "/ordenes_fumigacion/pendiente_factura",
        },
        {
          title: "Estadisticas",
          url: "/estadisticas",
        },
      ],
    },
    {
      title: "Gestión",
      url: "#",
      items: [
        {
          title: "Productos",
          url: "/productos",
        },
        {
          title: "Cultivos",
          url: "/cultivos",
        },
        {
          title: "Maquinistas",
          url: "/maquinistas",
        },
      ],
    },
  ],
}

export function AppSidebar({...props}) {
  const location = useLocation()

  const isItemActive = (url) => {
    // For specific routes like pendiente_factura, use exact match
    if (url === "/ordenes_fumigacion/pendiente_factura") {
      return location.pathname === url
    }
    // For ordenes main list, exclude the pendiente_factura subroute
    if (url === "/ordenes_fumigacion") {
      return location.pathname.startsWith(url) && !location.pathname.startsWith("/ordenes_fumigacion/pendiente_factura")
    }
    // For others, use startsWith to cover subroutes
    return location.pathname.startsWith(url)
  }

  const gestionItems = data.navMain.find(group => group.title === "Gestión")?.items || []
  const isGestionActive = gestionItems.some(item => isItemActive(item.url))

  const [gestionOpen, setGestionOpen] = React.useState(true)

  React.useEffect(() => {
    if (isGestionActive) {
      setGestionOpen(true)
    }
  }, [isGestionActive])

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        Sistema ARV
      </SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        {data.navMain.map((item) => (
          item.title === "Gestión" ? (
            <Collapsible
              key={item.title}
              open={gestionOpen}
              onOpenChange={setGestionOpen}
              className="group/collapsible"
            >
              <SidebarGroup>
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel className={`group/label cursor-pointer ${isGestionActive ? 'font-bold' : ''}`}>
                    {item.title}
                    <ChevronDown className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => {
                          const isActive = isItemActive(subItem.url)

                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isActive}
                                className={isActive ? "font-bold" : ""}
                              >
                                <a href={subItem.url}>{subItem.title}</a>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )
                        })}
                      </SidebarMenuSub>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          ) : (
            <SidebarGroup key={item.title}>
              <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {item.items.map((subItem) => {
                    const isActive = isItemActive(subItem.url)

                    return (
                      <SidebarMenuItem key={subItem.title}>
                        <SidebarMenuButton asChild isActive={isActive} className={isActive ? "font-bold" : ""}>
                          <a href={subItem.url}>{subItem.title}</a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
