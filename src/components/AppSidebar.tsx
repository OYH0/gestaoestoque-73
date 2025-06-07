
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Snowflake, 
  Thermometer, 
  Package, 
  Trash2, 
  BarChart3,
  Beef,
  LogOut,
  User,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

const items = [
  { title: 'Dashboard', url: '/', icon: BarChart3 },
  { title: 'Câmara Fria', url: '/camara-fria', icon: Snowflake },
  { title: 'Câmara Refrigerada', url: '/camara-refrigerada', icon: Thermometer },
  { title: 'Estoque Seco', url: '/estoque-seco', icon: Package },
  { title: 'Descartáveis', url: '/descartaveis', icon: Trash2 },
];

export function AppSidebar() {
  const { isMobile, setOpenMobile } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-churrasco-gradient">
      {/* Header */}
      <div className="p-3 border-b border-white/15 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm shadow-lg border border-white/30">
            <Beef className="h-4 w-4 text-white drop-shadow-sm" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-white drop-shadow-sm">
              Gestão de Estoque
            </h2>
            <p className="text-xs text-white/75 drop-shadow-sm">Companhia do Churrasco</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 p-2 space-y-1">
        {items.map((item) => {
          const isActive = currentPath === item.url;
          return (
            <NavLink 
              key={item.title}
              to={item.url} 
              end
              onClick={handleNavClick}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 group relative overflow-hidden ${
                isActive 
                  ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/30' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white hover:backdrop-blur-sm hover:border hover:border-white/15'
              }`}
            >
              <item.icon className={`h-4 w-4 flex-shrink-0 transition-all duration-300 drop-shadow-sm ${
                isActive ? 'scale-110 text-white' : 'group-hover:scale-105'
              }`} />
              <span className="font-medium text-sm drop-shadow-sm">
                {item.title}
              </span>
              {isActive && (
                <div className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-lg" />
              )}
            </NavLink>
          );
        })}
      </div>

      {/* User Section */}
      <div className="p-2 border-t border-white/15 flex-shrink-0">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/25 mb-2">
          <div className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center shadow-lg border border-white/30">
            <User className="h-3 w-3 text-white drop-shadow-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate drop-shadow-sm">oyh013@gmail.com</p>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          className="w-full justify-center gap-2 text-white/80 hover:text-white hover:bg-white/10 border border-white/25 rounded-lg py-1.5 text-sm transition-all duration-300 hover:border-white/30"
        >
          <LogOut className="h-3 w-3 drop-shadow-sm" />
          <span className="drop-shadow-sm">Sair</span>
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sidebar 
        collapsible="offcanvas" 
        className="border-r-0"
      >
        <SidebarContent>
          {sidebarContent}
        </SidebarContent>
      </Sidebar>
    );
  }

  // Desktop: sidebar fixa com altura completa
  return (
    <div className="w-56 h-screen fixed left-0 top-0 z-50 border-r-0">
      <SidebarContent className="h-full">
        {sidebarContent}
      </SidebarContent>
    </div>
  );
}
