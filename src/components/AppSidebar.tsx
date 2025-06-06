
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Snowflake, 
  Thermometer, 
  Package, 
  Trash2, 
  BarChart3,
  Beef,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const items = [
  { title: 'Dashboard', url: '/', icon: BarChart3 },
  { title: 'Câmara Fria', url: '/camara-fria', icon: Snowflake },
  { title: 'Câmara Refrigerada', url: '/camara-refrigerada', icon: Thermometer },
  { title: 'Estoque Seco', url: '/estoque-seco', icon: Package },
  { title: 'Descartáveis', url: '/descartaveis', icon: Trash2 },
];

export function AppSidebar() {
  const { isMobile } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <Sidebar collapsible={isMobile ? "offcanvas" : "none"} className="border-r border-sidebar-border bg-churrasco-gradient">
      <div className="flex h-full flex-col bg-churrasco-dark/95 backdrop-blur-sm">
        <div className="flex items-center justify-between p-6 border-b border-sidebar-border/30">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-churrasco-red to-churrasco-orange shadow-lg">
              <Beef className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-xl bg-gradient-to-r from-churrasco-red to-churrasco-orange bg-clip-text text-transparent">
                ChurrasControl
              </h2>
              <p className="text-xs text-sidebar-foreground/70">Companhia do Churrasco</p>
            </div>
          </div>
        </div>

        <SidebarContent className="flex-1 px-4 py-6">
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider mb-3 px-2">
              Gestão de Estoque
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-2">
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        end
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                            isActive 
                              ? 'bg-gradient-to-r from-churrasco-red/20 to-churrasco-orange/20 text-churrasco-orange shadow-lg border-l-4 border-churrasco-red backdrop-blur-sm' 
                              : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground hover:shadow-md'
                          }`
                        }
                      >
                        <item.icon className={`h-5 w-5 flex-shrink-0 transition-all duration-300 ${
                          currentPath === item.url ? 'scale-110 text-churrasco-orange' : 'group-hover:scale-105'
                        }`} />
                        <span className="font-medium text-sm truncate">
                          {item.title}
                        </span>
                        {currentPath === item.url && (
                          <div className="absolute right-3 w-2 h-2 bg-churrasco-red rounded-full animate-pulse shadow-lg" />
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <div className="p-4 border-t border-sidebar-border/30">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-sidebar-accent/20 to-churrasco-brown/20 backdrop-blur-sm">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-churrasco-red to-churrasco-orange flex items-center justify-center shadow-lg">
              <span className="text-white text-sm font-bold">U</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">Usuário</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">Administrador</p>
            </div>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
