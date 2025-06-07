
import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Bell, Settings, User, Search, LogOut, Shield, Palette, Database, HelpCircle, UserCircle, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
            {/* Popup de Notificações */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="relative hover:bg-churrasco-red/10 transition-colors">
                  <Bell className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-churrasco-red to-churrasco-orange rounded-full text-xs flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b">
                  <h4 className="font-semibold">Notificações</h4>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  <div className="p-4 space-y-3">
                    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50">
                      <div className="w-2 h-2 bg-churrasco-red rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Estoque baixo - Picanha Suína</p>
                        <p className="text-xs text-muted-foreground">Apenas 0kg restantes</p>
                        <p className="text-xs text-muted-foreground">5 min atrás</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Alerta - Coxão Mole</p>
                        <p className="text-xs text-muted-foreground">Estoque abaixo do mínimo (2kg)</p>
                        <p className="text-xs text-muted-foreground">1 hora atrás</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Reposição concluída</p>
                        <p className="text-xs text-muted-foreground">Arroz Branco - 25kg adicionados</p>
                        <p className="text-xs text-muted-foreground">2 horas atrás</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-3 border-t">
                  <Button variant="ghost" className="w-full text-sm">
                    Ver todas as notificações
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* Popup de Configurações */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="hover:bg-churrasco-red/10 transition-colors">
                  <Settings className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96 p-0" align="end">
                <Tabs defaultValue="geral" className="w-full">
                  <div className="p-4 border-b">
                    <h4 className="font-semibold mb-3">Configurações</h4>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="geral">Geral</TabsTrigger>
                      <TabsTrigger value="estoque">Estoque</TabsTrigger>
                      <TabsTrigger value="sistema">Sistema</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="geral" className="p-4 space-y-4 m-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Palette className="w-4 h-4" />
                          <span className="text-sm">Tema escuro</span>
                        </div>
                        <Button variant="outline" size="sm">Alternar</Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4" />
                          <span className="text-sm">Notificações</span>
                        </div>
                        <Button variant="outline" size="sm">Ativado</Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <HelpCircle className="w-4 h-4" />
                          <span className="text-sm">Ajuda</span>
                        </div>
                        <Button variant="outline" size="sm">Ver</Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="estoque" className="p-4 space-y-4 m-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4" />
                          <span className="text-sm">Alertas de estoque baixo</span>
                        </div>
                        <Button variant="outline" size="sm">Configurar</Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          <span className="text-sm">Backup automático</span>
                        </div>
                        <Button variant="outline" size="sm">Diário</Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="sistema" className="p-4 space-y-4 m-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          <span className="text-sm">Segurança</span>
                        </div>
                        <Button variant="outline" size="sm">Avançado</Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4" />
                          <span className="text-sm">Exportar dados</span>
                        </div>
                        <Button variant="outline" size="sm">Exportar</Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </PopoverContent>
            </Popover>

            {/* Popup de Usuário */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="hover:bg-churrasco-red/10 transition-colors">
                  <User className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <Tabs defaultValue="perfil" className="w-full">
                  <div className="p-4 border-b">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-churrasco-red to-churrasco-orange rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold">João Silva</p>
                        <p className="text-sm text-muted-foreground">Gerente de Estoque</p>
                      </div>
                    </div>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="perfil">Perfil</TabsTrigger>
                      <TabsTrigger value="conta">Conta</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="perfil" className="p-4 space-y-4 m-0">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <UserCircle className="w-4 h-4" />
                        <div>
                          <p className="text-sm font-medium">Nome completo</p>
                          <p className="text-xs text-muted-foreground">João Silva Santos</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4" />
                        <div>
                          <p className="text-sm font-medium">Email</p>
                          <p className="text-xs text-muted-foreground">joao.silva@churrasco.com</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4" />
                        <div>
                          <p className="text-sm font-medium">Telefone</p>
                          <p className="text-xs text-muted-foreground">(11) 99999-9999</p>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      Editar Perfil
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="conta" className="p-4 space-y-4 m-0">
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <Settings className="w-4 h-4 mr-2" />
                        Alterar senha
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Shield className="w-4 h-4 mr-2" />
                        Privacidade
                      </Button>
                      <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sair da conta
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </header>
  );
}
