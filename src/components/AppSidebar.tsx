
import React from "react"
import { Home, Snowflake, Thermometer, Package2, FileText, LogOut, Settings, Wine } from "lucide-react"
import { NavLink } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { useUserPermissions } from "@/hooks/useUserPermissions"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useIsMobile } from "@/hooks/use-mobile"

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
    title: "Bebidas",
    url: "/bebidas",
    icon: Wine,
  },
]

const adminItems = [
  {
    title: "Configurações",
    url: "/configuracoes",
    icon: Settings,
  },
]

export function AppSidebar() {
  const { signOut, user } = useAuth();
  const { isAdmin } = useUserPermissions();
  const { setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();

  const handleSignOut = async () => {
    await signOut();
  };

  const handleItemClick = () => {
    // Fecha a sidebar automaticamente em dispositivos móveis
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const allItems = [...items, ...(isAdmin ? adminItems : [])];

  return (
    <Sidebar className="border-0 w-full md:w-64">
      <div className="bg-gradient-to-r from-churrasco-red to-churrasco-orange h-full">
        <SidebarContent className="bg-transparent flex flex-col h-full">
          <div className="flex-1">
            <SidebarGroup className="pt-6 md:pt-8 px-3 md:px-4">
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1 md:space-y-2">
                  {allItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild className="w-full p-0">
                        <NavLink 
                          to={item.url} 
                          onClick={handleItemClick}
                          className={({ isActive }) => 
                            `flex items-center gap-3 md:gap-4 w-full px-3 md:px-4 py-3 md:py-4 text-white/90 hover:bg-white/10 transition-all duration-200 font-medium text-sm md:text-base h-auto rounded-xl ${
                              isActive 
                                ? "bg-white/20 text-white shadow-lg border border-white/30 backdrop-blur-sm" 
                                : ""
                            }`
                          }
                        >
                          <item.icon className="h-5 w-5 md:h-6 md:w-6 shrink-0" />
                          <span className="text-sm md:text-base truncate">{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>
          
          <SidebarFooter className="p-3 md:p-4 mt-auto">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4 px-1 md:px-2">
              <Avatar className="h-8 w-8 md:h-10 md:w-10">
                <AvatarFallback className="bg-white/20 text-white text-sm border border-white/30">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-white/90 text-xs md:text-sm truncate font-medium">
                {user?.email || 'usuário'}
              </span>
            </div>
            
            <Button 
              onClick={handleSignOut}
              className="w-full justify-start rounded-xl px-3 md:px-4 py-3 md:py-4 text-white bg-white/10 border border-white/20 hover:bg-white/20 hover:text-white transition-all duration-200 font-medium text-sm md:text-base h-auto backdrop-blur-sm"
            >
              <LogOut className="h-5 w-5 md:h-6 md:w-6 shrink-0 mr-2 md:mr-3" />
              <span className="text-sm md:text-base">Sair</span>
            </Button>
          </SidebarFooter>
        </SidebarContent>
      </div>
    </Sidebar>
  )
}
