
import React from "react"
import { Home, Snowflake, Thermometer, Package2, FileText, LogOut } from "lucide-react"
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
]

export function AppSidebar() {
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Sidebar className="border-r-0 w-full md:w-64 shadow-2xl">
      <div className="bg-gradient-to-b from-churrasco-brown via-churrasco-red to-churrasco-brown h-full">
        <SidebarContent className="bg-transparent flex flex-col h-full">
          <div className="flex-1">
            <SidebarGroup className="pt-4 md:pt-8 px-2 md:px-4">
              <SidebarGroupLabel className="text-white font-bold text-lg md:text-xl mb-4 md:mb-8 px-0 text-left">
                Gestão Financeira
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1 md:space-y-2">
                  {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild className="w-full p-0">
                        <NavLink 
                          to={item.url} 
                          className={({ isActive }) => 
                            `flex items-center gap-2 md:gap-3 w-full px-2 md:px-4 py-2 md:py-3 text-white/90 hover:bg-white/10 transition-all duration-200 font-medium text-sm md:text-base h-auto rounded-lg ${
                              isActive 
                                ? "bg-gradient-to-r from-churrasco-red to-churrasco-brown text-white shadow-lg border border-white/20" 
                                : ""
                            }`
                          }
                        >
                          <item.icon className="h-4 w-4 md:h-5 md:w-5 shrink-0" />
                          <span className="text-sm md:text-base truncate">{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>
          
          <SidebarFooter className="p-2 md:p-4 mt-auto">
            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4 px-1 md:px-2">
              <Avatar className="h-6 w-6 md:h-8 md:w-8">
                <AvatarFallback className="bg-white/20 text-white text-xs">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-white/90 text-xs md:text-sm truncate">
                {user?.email || 'usuário'}
              </span>
            </div>
            
            <Button 
              onClick={handleSignOut}
              className="w-full justify-start rounded-lg px-2 md:px-4 py-2 md:py-3 text-white bg-transparent border border-white/20 hover:bg-white/10 hover:text-white transition-all duration-200 font-medium text-sm md:text-base h-auto"
            >
              <LogOut className="h-4 w-4 md:h-5 md:w-5 shrink-0 mr-2 md:mr-3" />
              <span className="text-sm md:text-base">Sair</span>
            </Button>
          </SidebarFooter>
        </SidebarContent>
      </div>
    </Sidebar>
  )
}
