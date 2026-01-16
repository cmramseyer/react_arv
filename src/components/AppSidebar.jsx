import * as React from "react"

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
          title: "Productos",
          url: "/productos",
        },
        {
          title: "Ordenes",
          url: "/ordenes_fumigacion",
        },
        {
          title: "Facturación Pendiente",
          url: "/ordenes_fumigacion/pendiente_factura",
        },
      ],
    }
  ],
}

export function AppSidebar({...props}) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        Sistema ARV
      </SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={item.isActive}>
                      <a href={item.url}>{item.title}</a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
