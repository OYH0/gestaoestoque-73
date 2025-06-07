
import { Snowflake, Package, Trash2, BarChart3, Thermometer } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

const navigationItems = [
  {
    title: 'Dashboard',
    url: '/',
    icon: BarChart3,
  },
  {
    title: 'Câmara Fria',
    url: '/camara-fria',
    icon: Snowflake,
  },
  {
    title: 'Câmara Refrigerada',
    url: '/camara-refrigerada',
    icon: Thermometer,
  },
  {
    title: 'Estoque Seco',
    url: '/estoque-seco',
    icon: Package,
  },
  {
    title: 'Descartáveis',
    url: '/descartaveis',
    icon: Trash2,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const isMobile = useIsMobile();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname === path;
  };

  return (
    <Sidebar className="border-r bg-card h-screen">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-bold text-primary px-4 py-3">
            {isMobile ? 'Menu' : 'Sistema de Estoque'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="w-full">
                    <NavLink
                      to={item.url}
                      className={({ isActive: linkIsActive }) =>
                        `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-accent ${
                          isActive(item.url) || linkIsActive
                            ? 'bg-accent text-accent-foreground font-medium'
                            : 'text-muted-foreground hover:text-accent-foreground'
                        } ${isMobile ? 'text-sm py-2.5' : 'text-base py-3'}`
                      }
                    >
                      <item.icon className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} flex-shrink-0`} />
                      <span className={`${isMobile ? 'text-xs' : 'text-sm'} truncate`}>
                        {isMobile && item.title === 'Câmara Refrigerada' ? 'Câm. Refrig.' : item.title}
                      </span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
