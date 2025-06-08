
import React from "react"
import { Home, Snowflake, Thermometer, Package2, FileText, BarChart3 } from "lucide-react"
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
    icon: Package2,
  },
  {
    title: "Descartáveis",
    url: "/descartaveis",
    icon: FileText,
  },
  {
    title: "Relatórios",
    url: "/relatorios",
    icon: BarChart3,
  },
]

export function AppSidebar() {
  return (
    <Sidebar className="border-r border-border/50 bg-gradient-to-b from-sidebar via-sidebar/95 to-sidebar/90 backdrop-blur-sm">
      <SidebarContent className="bg-transparent">
        <SidebarGroup className="pt-8">
          <SidebarGroupLabel className="text-sidebar-foreground/90 font-semibold text-sm mb-6 px-4 tracking-wide">
            🥩 ChurrasControl
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className="mx-2 rounded-lg transition-all duration-200 hover:bg-sidebar-accent/60 text-sidebar-foreground/80 hover:text-sidebar-accent-foreground data-[active=true]:bg-churrasco-red data-[active=true]:text-white data-[active=true]:shadow-md font-medium"
                  >
                    <NavLink 
                      to={item.url} 
                      className={({ isActive }) => 
                        isActive 
                          ? "flex items-center gap-3 px-3 py-2.5 bg-churrasco-red text-white rounded-lg shadow-md" 
                          : "flex items-center gap-3 px-3 py-2.5"
                      }
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="text-sm">{item.title}</span>
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
