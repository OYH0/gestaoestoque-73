
import React from "react"
import { Home, Snowflake, Thermometer, Package2, FileText, LogOut, BarChart3 } from "lucide-react"
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
  SidebarHeader,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    description: "Visão geral do sistema"
  },
  {
    title: "Câmara Fria",
    url: "/camara-fria",
    icon: Snowflake,
    description: "Produtos congelados"
  },
  {
    title: "Câmara Refrigerada",
    url: "/camara-refrigerada",
    icon: Thermometer,
    description: "Produtos refrigerados"
  },
  {
    title: "Estoque Seco",
    url: "/estoque-seco",
    icon: Package2,
    description: "Produtos secos"
  },
  {
    title: "Descartáveis",
    url: "/descartaveis",
    icon: FileText,
    description: "Materiais descartáveis"
  },
]

export function AppSidebar() {
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Sidebar className="border-r-0 shadow-modern-lg">
      <div className="bg-gradient-primary h-full">
        <SidebarContent className="bg-transparent flex flex-col h-full">
          <SidebarHeader className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div className="hidden md:block">
                <h2 className="text-white font-bold text-lg">Gestão</h2>
                <p className="text-white/80 text-sm">Financeira</p>
              </div>
            </div>
          </SidebarHeader>

          <Separator className="bg-white/20 mx-4" />

          <div className="flex-1 px-4 md:px-6 py-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-white/70 font-medium text-xs uppercase tracking-wider mb-4">
                Menu Principal
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-2">
                  {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild className="w-full p-0">
                        <NavLink 
                          to={item.url} 
                          className={({ isActive }) => 
                            `group flex items-center gap-3 w-full px-3 py-3 text-white/90 hover:bg-white/10 transition-all duration-200 font-medium text-sm rounded-lg ${
                              isActive 
                                ? "bg-white/20 text-white shadow-modern backdrop-blur-sm" 
                                : ""
                            }`
                          }
                        >
                          <item.icon className="h-5 w-5 shrink-0 group-hover:scale-110 transition-transform" />
                          <div className="hidden md:block text-left">
                            <span className="block text-sm font-medium">{item.title}</span>
                            <span className="block text-xs text-white/70">{item.description}</span>
                          </div>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>
          
          <SidebarFooter className="p-4 md:p-6 mt-auto">
            <Separator className="bg-white/20 mb-4" />
            
            <div className="flex items-center gap-3 mb-4 px-2">
              <Avatar className="h-8 w-8 md:h-10 md:w-10 ring-2 ring-white/20">
                <AvatarFallback className="bg-white/20 text-white text-sm font-medium">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-white text-sm font-medium truncate">
                  {user?.email?.split('@')[0] || 'Usuário'}
                </p>
                <p className="text-white/70 text-xs truncate">
                  {user?.email || 'usuário@email.com'}
                </p>
              </div>
            </div>
            
            <Button 
              onClick={handleSignOut}
              className="w-full justify-start rounded-lg px-3 py-3 text-white bg-white/10 border border-white/20 hover:bg-white/20 hover:text-white transition-all duration-200 font-medium text-sm h-auto backdrop-blur-sm"
            >
              <LogOut className="h-4 w-4 shrink-0 mr-3" />
              <span className="hidden md:inline">Sair do Sistema</span>
              <span className="md:hidden">Sair</span>
            </Button>
          </SidebarFooter>
        </SidebarContent>
      </div>
    </Sidebar>
  )
}
