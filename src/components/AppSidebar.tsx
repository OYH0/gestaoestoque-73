
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Snowflake, 
  Thermometer, 
  Package, 
  Trash2, 
  BarChart3,
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
  SidebarTrigger,
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
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon" className="border-r border-border/40">
      <div className="flex h-full flex-col bg-gradient-to-b from-background to-muted/20">
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
              <Snowflake className="h-5 w-5 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="font-bold text-lg bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
                  ChurrasControl
                </h2>
                <p className="text-xs text-muted-foreground">Gestão de Estoque</p>
              </div>
            )}
          </div>
          <SidebarTrigger className="h-8 w-8" />
        </div>

        <SidebarContent className="flex-1 px-3 py-4">
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Menu Principal
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        end
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                            isActive 
                              ? 'bg-gradient-to-r from-red-50 to-red-100 text-red-600 shadow-sm border-l-4 border-red-500' 
                              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                          }`
                        }
                      >
                        <item.icon className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 ${
                          currentPath === item.url ? 'scale-110' : 'group-hover:scale-105'
                        }`} />
                        {!isCollapsed && (
                          <span className="font-medium text-sm truncate">
                            {item.title}
                          </span>
                        )}
                        {currentPath === item.url && !isCollapsed && (
                          <div className="absolute right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <div className="p-4 border-t border-border/40">
          <div className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 ${
            isCollapsed ? 'justify-center' : ''
          }`}>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">U</span>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">Usuário</p>
                <p className="text-xs text-muted-foreground truncate">Administrador</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
