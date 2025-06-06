
import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Bell, Settings, User, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Header() {
  return (
    <header className="h-16 bg-gradient-to-r from-background via-background to-muted/20 border-b border-border/40 backdrop-blur-sm">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="md:hidden h-8 w-8" />
          <div className="hidden md:block">
            <h1 className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
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
              className="pl-10 w-64 bg-muted/30 border-border/40 focus:bg-background transition-colors"
            />
          </div>
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="relative hover:bg-muted/50 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-red-500 to-red-600 rounded-full text-xs flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              </span>
            </Button>
            <Button variant="ghost" size="sm" className="hover:bg-muted/50 transition-colors">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="hover:bg-muted/50 transition-colors">
              <User className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
