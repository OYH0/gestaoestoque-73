
import React from "react"
import { Home, Snowflake, Thermometer, Package, Trash2, BarChart3 } from "lucide-react"
import { NavLink } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Câmara Fria",
    url: "/camara-fria",
    icon: Snowflake,
  },
  {
    title: "Câmara Refrigerada",
    url: "/camara-refrigerada",
    icon: Thermometer,
  },
  {
    title: "Estoque Seco",
    url: "/estoque-seco",
    icon: Package,
  },
  {
    title: "Descartáveis",
    url: "/descartaveis",
    icon: Trash2,
  },
  {
    title: "Relatórios",
    url: "/relatorios",
    icon: BarChart3,
  },
]

export function AppSidebar() {
  return (
    <Sidebar className="border-r-0 bg-gradient-to-b from-churrasco-red via-churrasco-red/90 to-churrasco-red/80">
      <SidebarContent className="bg-transparent">
        <SidebarGroup>
          <SidebarGroupLabel className="text-churrasco-cream font-bold text-lg mb-4">
            🥩 ChurrasControl
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="hover:bg-churrasco-cream/20 text-churrasco-cream hover:text-churrasco-cream data-[active=true]:bg-churrasco-cream data-[active=true]:text-churrasco-red">
                    <NavLink to={item.url} className={({ isActive }) => isActive ? "bg-churrasco-cream text-churrasco-red" : ""}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
