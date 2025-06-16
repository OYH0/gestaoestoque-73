
import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from '@/components/ui/carousel';
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

// Definir as rotas e componentes principais
const mainPages = [
  { path: '/', component: Dashboard, title: 'Dashboard' },
  { path: '/camara-fria', component: CamaraFria, title: 'Câmara Fria' },
  { path: '/camara-refrigerada', component: CamaraRefrigerada, title: 'Câmara Refrigerada' },
  { path: '/estoque-seco', component: EstoqueSeco, title: 'Estoque Seco' },
  { path: '/descartaveis', component: Descartaveis, title: 'Descartáveis' },
];

const Index = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const [api, setApi] = useState<CarouselApi>();
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Encontrar o índice da página atual
  useEffect(() => {
    const currentIndex = mainPages.findIndex(page => page.path === location.pathname);
    if (currentIndex !== -1 && currentIndex !== currentPageIndex) {
      setCurrentPageIndex(currentIndex);
      if (api) {
        api.scrollTo(currentIndex);
      }
    }
  }, [location.pathname, api, currentPageIndex]);

  // Configurar o carousel quando a API estiver disponível
  useEffect(() => {
    if (!api) return;

    api.on('select', () => {
      const selectedIndex = api.selectedScrollSnap();
      const selectedPage = mainPages[selectedIndex];
      if (selectedPage && location.pathname !== selectedPage.path) {
        navigate(selectedPage.path);
      }
    });
  }, [api, navigate, location.pathname]);

  // Renderizar versão mobile com carousel de swipe
  if (isMobile) {
    return (
      <ProtectedRoute>
        <SidebarProvider>
          <div className="min-h-screen flex w-full relative overflow-hidden bg-churrasco-cream">
            <AppSidebar />
            <div className="flex-1 flex flex-col min-w-0 h-screen relative z-10">
              <Header />
              <main className="flex-1 relative overflow-hidden">
                <Carousel
                  setApi={setApi}
                  className="w-full h-full"
                  opts={{
                    align: "start",
                    loop: false,
                    axis: "x",
                    dragFree: false,
                    containScroll: "trimSnaps",
                    skipSnaps: false,
                    inViewThreshold: 0.7,
                    watchDrag: (emblaApi, evt) => {
                      // Só permitir drag horizontal se o movimento for mais horizontal que vertical
                      const deltaX = Math.abs(evt.deltaX || 0);
                      const deltaY = Math.abs(evt.deltaY || 0);
                      return deltaX > deltaY * 1.5;
                    }
                  }}
                >
                  <CarouselContent className="h-full">
                    {mainPages.map((page, index) => (
                      <CarouselItem key={page.path} className="h-full">
                        <div 
                          className="h-full overflow-y-auto overflow-x-hidden" 
                          style={{ 
                            touchAction: 'pan-y pinch-zoom',
                            overscrollBehavior: 'contain'
                          }}
                        >
                          <div className="p-4 relative z-10 max-w-full min-h-full">
                            <page.component />
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </ProtectedRoute>
    );
  }

  // Renderizar versão desktop normal
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="min-h-screen flex w-full relative overflow-hidden bg-churrasco-cream">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0 h-screen relative z-10">
            <Header />
            <main className="flex-1 p-4 md:p-6 relative overflow-auto">
              <div className="relative z-10 max-w-full">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/camara-fria" element={<CamaraFria />} />
                  <Route path="/camara-refrigerada" element={<CamaraRefrigerada />} />
                  <Route path="/estoque-seco" element={<EstoqueSeco />} />
                  <Route path="/descartaveis" element={<Descartaveis />} />
                  <Route path="/configuracoes" element={<UserManagement />} />
                </Routes>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
};

export default Index;
