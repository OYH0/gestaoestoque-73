
import React from "react"
import { Home, Snowflake, Thermometer, Package2, FileText, LogOut } from "lucide-react"
import { NavLink } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
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
    <Sidebar className="border-r-0 w-full shadow-2xl">
      <div className="bg-churrasco-gradient h-full">
        <SidebarContent className="bg-transparent flex flex-col h-full">
          <div className="flex-1">
            <SidebarGroup className="pt-4 px-2 sm:pt-6 sm:px-4">
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild className="w-full p-0">
                        <NavLink 
                          to={item.url} 
                          className={({ isActive }) => 
                            `flex items-center gap-3 w-full px-3 py-3 sm:px-4 sm:py-4 text-white/90 hover:bg-white/10 active:bg-white/15 transition-all duration-200 font-medium text-sm sm:text-base h-auto rounded-xl touch-manipulation ${
                              isActive 
                                ? "bg-white/20 text-white shadow-lg border border-white/30 backdrop-blur-sm" 
                                : ""
                            }`
                          }
                        >
                          <item.icon className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
                          <span className="text-sm sm:text-base truncate">{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>
          
          <SidebarFooter className="p-2 sm:p-4 mt-auto">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 px-1 sm:px-2">
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                <AvatarFallback className="bg-white/20 text-white text-sm border border-white/30">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-white/90 text-xs sm:text-sm truncate font-medium">
                {user?.email || 'usuário'}
              </span>
            </div>
            
            <Button 
              onClick={handleSignOut}
              className="w-full justify-start rounded-xl px-3 py-3 sm:px-4 sm:py-4 text-white bg-white/10 border border-white/20 hover:bg-white/20 active:bg-white/25 hover:text-white transition-all duration-200 font-medium text-sm sm:text-base h-auto backdrop-blur-sm touch-manipulation min-h-[44px]"
            >
              <LogOut className="h-5 w-5 sm:h-6 sm:w-6 shrink-0 mr-2 sm:mr-3" />
              <span className="text-sm sm:text-base">Sair</span>
            </Button>
          </SidebarFooter>
        </SidebarContent>
      </div>
    </Sidebar>
  )
}
