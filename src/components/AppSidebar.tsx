
import React from "react"
import { Home, Snowflake, Thermometer, Package2, FileText, BarChart3, LogOut } from "lucide-react"
import { NavLink } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

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
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Sidebar className="border-r-0 bg-churrasco-gradient w-64 shadow-2xl">
      <SidebarContent className="bg-transparent flex flex-col h-full">
        <div className="flex-1">
          <SidebarGroup className="pt-8 px-4">
            <SidebarGroupLabel className="text-primary-foreground font-bold text-xl mb-8 px-0 text-center">
              Gestão Financeira
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-2">
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      className="w-full justify-start rounded-xl px-4 py-3 text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground transition-all duration-200 data-[active=true]:bg-primary-foreground/20 data-[active=true]:text-primary-foreground font-medium text-base h-auto shadow-lg hover:shadow-xl"
                    >
                      <NavLink 
                        to={item.url} 
                        className={({ isActive }) => 
                          `flex items-center gap-4 w-full ${
                            isActive 
                              ? "bg-primary-foreground/20 text-primary-foreground rounded-xl shadow-lg" 
                              : ""
                          }`
                        }
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        <span className="text-base">{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
        
        <SidebarFooter className="p-4 mt-auto">
          <div className="flex items-center gap-3 mb-4 px-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground text-xs">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="text-primary-foreground/80 text-sm truncate">
              {user?.email || 'usuário'}
            </span>
          </div>
          
          <Button 
            onClick={handleSignOut}
            variant="ghost"
            className="w-full justify-start rounded-xl px-4 py-3 text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground transition-all duration-200 font-medium text-base h-auto shadow-lg hover:shadow-xl"
          >
            <LogOut className="h-5 w-5 shrink-0 mr-4" />
            <span className="text-base">Sair</span>
          </Button>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  )
}
