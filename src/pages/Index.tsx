
import React, { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
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
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';

const Index = () => {
  const isMobile = useIsMobile();

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
            
            <div className="flex-1 relative overflow-hidden">
              <Carousel 
                className="h-full"
                opts={{
                  align: "start",
                  loop: false,
                  skipSnaps: false,
                  dragFree: false
                }}
              >
                <CarouselContent className="h-full -ml-0">
                  {tabs.map((tab) => (
                    <CarouselItem key={tab.id} className="pl-0 basis-full h-full">
                      <div 
                        className="h-full overflow-auto" 
                        style={{
                          touchAction: 'pan-y pinch-zoom',
                          overscrollBehavior: 'contain'
                        }}
                      >
                        <main className="p-4 md:p-6 relative h-full">
                          <div className="relative z-10 max-w-full">
                            {tab.component}
                          </div>
                        </main>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
};

export default Index;
