
import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Bell, Settings, User, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSidebar } from '@/components/ui/sidebar';

export function Header() {
  const { isMobile } = useSidebar();

  return (
    <header className="h-16 bg-gradient-to-r from-background via-churrasco-cream/50 to-background border-b border-border/40 backdrop-blur-sm shadow-sm">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        <div className="flex items-center gap-4">
          {isMobile && <SidebarTrigger className="h-8 w-8" />}
          <div className={isMobile ? "hidden" : "block"}>
            <h1 className="text-xl font-bold bg-gradient-to-r from-churrasco-red to-churrasco-orange bg-clip-text text-transparent">
              ChurrasControl
            </h1>
            <p className="text-sm text-muted-foreground">Sistema de Gestão de Estoque</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 relative">
            <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar produtos..." 
              className="pl-10 w-64 bg-muted/30 border-border/40 focus:bg-background transition-colors focus:border-churrasco-red/50"
            />
          </div>
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="relative hover:bg-churrasco-red/10 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-churrasco-red to-churrasco-orange rounded-full text-xs flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              </span>
            </Button>
            <Button variant="ghost" size="sm" className="hover:bg-churrasco-red/10 transition-colors">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="hover:bg-churrasco-red/10 transition-colors">
              <User className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
