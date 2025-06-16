
import React, { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppSidebar } from '@/components/AppSidebar';
import { Header } from '@/components/Header';
import { Dashboard } from '@/components/Dashboard';
import CamaraFria from '@/components/CamaraFria';
import { CamaraRefrigerada } from '@/components/CamaraRefrigerada';
import EstoqueSeco from '@/components/EstoqueSeco';
import Descartaveis from '@/components/Descartaveis';
import { UserManagement } from '@/components/UserManagement';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', component: <Dashboard /> },
    { id: 'camara-fria', label: 'Câmara Fria', component: <CamaraFria /> },
    { id: 'camara-refrigerada', label: 'Câmara Refrigerada', component: <CamaraRefrigerada /> },
    { id: 'estoque-seco', label: 'Estoque Seco', component: <EstoqueSeco /> },
    { id: 'descartaveis', label: 'Descartáveis', component: <Descartaveis /> },
    { id: 'configuracoes', label: 'Configurações', component: <UserManagement /> }
  ];

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="min-h-screen flex w-full relative overflow-hidden bg-churrasco-cream">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0 h-screen relative z-10">
            <Header />
            
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="flex-1 flex flex-col h-full"
            >
              {/* Navegação das abas - visível apenas no mobile */}
              {isMobile && (
                <div className="border-b bg-background px-4">
                  <TabsList className="grid w-full grid-cols-3 gap-1 h-auto p-1">
                    <TabsTrigger 
                      value="dashboard" 
                      className="text-xs px-2 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      Dashboard
                    </TabsTrigger>
                    <TabsTrigger 
                      value="camara-fria" 
                      className="text-xs px-2 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      C. Fria
                    </TabsTrigger>
                    <TabsTrigger 
                      value="camara-refrigerada" 
                      className="text-xs px-2 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      C. Refrig.
                    </TabsTrigger>
                  </TabsList>
                  <TabsList className="grid w-full grid-cols-3 gap-1 h-auto p-1 mt-1">
                    <TabsTrigger 
                      value="estoque-seco" 
                      className="text-xs px-2 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      E. Seco
                    </TabsTrigger>
                    <TabsTrigger 
                      value="descartaveis" 
                      className="text-xs px-2 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      Descart.
                    </TabsTrigger>
                    <TabsTrigger 
                      value="configuracoes" 
                      className="text-xs px-2 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      Config.
                    </TabsTrigger>
                  </TabsList>
                </div>
              )}

              {/* Conteúdo das abas */}
              <div className="flex-1 relative overflow-hidden">
                {tabs.map((tab) => (
                  <TabsContent 
                    key={tab.id}
                    value={tab.id} 
                    className="h-full m-0 p-0 data-[state=active]:flex data-[state=inactive]:hidden"
                  >
                    <div className="flex-1 overflow-auto">
                      <main className="p-4 md:p-6 relative">
                        <div className="relative z-10 max-w-full">
                          {tab.component}
                        </div>
                      </main>
                    </div>
                  </TabsContent>
                ))}
              </div>
            </Tabs>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
};

export default Index;
