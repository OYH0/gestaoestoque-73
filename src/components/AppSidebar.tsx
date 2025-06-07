
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
  const { isMobile } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const sidebarContent = (
    <div className="flex h-full flex-col bg-gradient-to-br from-churrasco-red via-churrasco-orange to-churrasco-brown relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-t from-churrasco-brown/30 via-transparent to-churrasco-cream/10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-40 h-40 bg-churrasco-orange/20 rounded-full blur-2xl transform translate-x-20 -translate-y-20" />
      <div className="absolute bottom-32 left-0 w-32 h-32 bg-churrasco-cream/15 rounded-full blur-xl transform -translate-x-16" />
      <div className="absolute top-1/3 right-0 w-24 h-24 bg-churrasco-red/20 rounded-full blur-lg transform translate-x-12" />
      
      {/* Header */}
      <div className="relative z-10 p-6 border-b border-white/20">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-sm shadow-xl border border-white/40">
            <Beef className="h-6 w-6 text-white drop-shadow-sm" />
          </div>
          <div>
            <h2 className="font-bold text-xl text-white drop-shadow-sm">
              Gestão de Estoque
            </h2>
            <p className="text-xs text-white/80 drop-shadow-sm">Companhia do Churrasco</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="relative z-10 flex-1 p-4 space-y-2 overflow-y-auto">
        {items.map((item) => {
          const isActive = currentPath === item.url;
          return (
            <NavLink 
              key={item.title}
              to={item.url} 
              end
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                isActive 
                  ? 'bg-gradient-to-r from-white/25 to-white/15 text-white shadow-xl backdrop-blur-sm border border-white/40' 
                  : 'text-white/85 hover:bg-gradient-to-r hover:from-white/15 hover:to-white/5 hover:text-white hover:backdrop-blur-sm hover:border hover:border-white/20'
              }`}
            >
              <item.icon className={`h-5 w-5 flex-shrink-0 transition-all duration-300 drop-shadow-sm ${
                isActive ? 'scale-110 text-white' : 'group-hover:scale-105'
              }`} />
              <span className="font-medium text-sm drop-shadow-sm">
                {item.title}
              </span>
              {isActive && (
                <div className="absolute right-3 w-2 h-2 bg-white rounded-full animate-pulse shadow-lg" />
              )}
            </NavLink>
          );
        })}
      </div>

      {/* User Section */}
      <div className="relative z-10 p-4 border-t border-white/20">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-white/15 to-white/5 backdrop-blur-sm border border-white/30 mb-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-white/30 to-white/10 flex items-center justify-center shadow-lg border border-white/40">
            <User className="h-5 w-5 text-white drop-shadow-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate drop-shadow-sm">oyh013@gmail.com</p>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          className="w-full justify-center gap-2 text-white/85 hover:text-white hover:bg-gradient-to-r hover:from-white/15 hover:to-white/5 border border-white/30 rounded-xl py-3 transition-all duration-300 hover:border-white/40"
        >
          <LogOut className="h-4 w-4 drop-shadow-sm" />
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
        {sidebarContent}
      </Sidebar>
    );
  }

  // Desktop: sidebar fixa
  return (
    <div className="w-80 h-screen fixed left-0 top-0 z-50">
      {sidebarContent}
    </div>
  );
}
