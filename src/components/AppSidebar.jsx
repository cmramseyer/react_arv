import * as React from "react"
import { ChevronDown } from "lucide-react"
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
          title: "Facturación Pendiente",
          url: "/ordenes_fumigacion/pendiente_factura",
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
  const [gestionOpen, setGestionOpen] = React.useState(true)

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
                  <SidebarGroupLabel className="group/label cursor-pointer">
                    {item.title}
                    <ChevronDown className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild>
                              <a href={subItem.url}>{subItem.title}</a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
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
                  {item.items.map((subItem) => (
                    <SidebarMenuItem key={subItem.title}>
                      <SidebarMenuButton asChild isActive={subItem.isActive}>
                        <a href={subItem.url}>{subItem.title}</a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
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
