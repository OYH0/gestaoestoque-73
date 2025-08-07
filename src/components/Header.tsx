
import React from 'react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { LogOut, User, Home, Snowflake, Thermometer, Package2, FileText, Settings, Wine } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const routeConfig = {
  '/': {
    title: 'Dashboard',
    description: 'Visão geral do sistema',
    icon: Home
  },
  '/camara-fria': {
    title: 'Câmara Fria',
    description: 'Carnes e produtos congelados',
    icon: Snowflake
  },
  '/camara-refrigerada': {
    title: 'Câmara Refrigerada',
    description: 'Produtos refrigerados',
    icon: Thermometer
  },
  '/estoque-seco': {
    title: 'Estoque Seco',
    description: 'Produtos não perecíveis',
    icon: Package2
  },
  '/descartaveis': {
    title: 'Descartáveis',
    description: 'Pratos, copos e utensílios descartáveis',
    icon: FileText
  },
  '/bebidas': {
    title: 'Bebidas',
    description: 'Refrigerantes, sucos e bebidas em geral',
    icon: Wine
  },
  '/configuracoes': {
    title: 'Configurações',
    icon: Settings
  }
};

export function Header() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const currentRoute = routeConfig[location.pathname as keyof typeof routeConfig];
  const IconComponent = currentRoute?.icon || Home;

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
      <SidebarTrigger className="-ml-1" />
      
      {/* Desktop: title on the left after sidebar trigger */}
      {!isMobile && currentRoute && (
        <div className="flex items-center gap-3 ml-4">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <IconComponent className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">{currentRoute.title}</h1>
            {'description' in currentRoute && currentRoute.description && (
              <p className="text-sm text-muted-foreground">{currentRoute.description}</p>
            )}
          </div>
        </div>
      )}

      {/* Mobile: centered title */}
      {isMobile && currentRoute && (
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <IconComponent className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="text-center">
              <h1 className="text-lg font-semibold text-foreground">{currentRoute.title}</h1>
              {'description' in currentRoute && currentRoute.description && (
                <p className="text-xs text-muted-foreground">{currentRoute.description}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Spacer for desktop to push user menu to the right */}
      {!isMobile && <div className="flex-1" />}

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
              <span className="sr-only">Menu do usuário</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              {user?.email || 'Usuário'}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
