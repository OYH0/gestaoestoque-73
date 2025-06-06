
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
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="w-80 h-screen fixed left-0 top-0 z-50">
      <div className="flex h-full flex-col bg-gradient-to-b from-churrasco-red via-churrasco-red/90 to-churrasco-brown relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-churrasco-orange/10 via-transparent to-churrasco-brown/20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-churrasco-orange/10 rounded-full blur-xl transform translate-x-16 -translate-y-16" />
        <div className="absolute bottom-20 left-0 w-24 h-24 bg-churrasco-cream/10 rounded-full blur-lg transform -translate-x-12" />
        
        {/* Header */}
        <div className="relative z-10 p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm shadow-lg border border-white/30">
              <Beef className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-xl text-white">
                Gestão de Estoque
              </h2>
              <p className="text-xs text-white/70">Companhia do Churrasco</p>
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
                    ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/30' 
                    : 'text-white/80 hover:bg-white/10 hover:text-white hover:backdrop-blur-sm'
                }`}
              >
                <item.icon className={`h-5 w-5 flex-shrink-0 transition-all duration-300 ${
                  isActive ? 'scale-110' : 'group-hover:scale-105'
                }`} />
                <span className="font-medium text-sm">
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
        <div className="relative z-10 p-4 border-t border-white/10">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 mb-3">
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center shadow-lg border border-white/30">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">oyh013@gmail.com</p>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            className="w-full justify-center gap-2 text-white/80 hover:text-white hover:bg-white/10 border border-white/20 rounded-xl py-3 transition-all duration-300"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
    </div>
  );
}
