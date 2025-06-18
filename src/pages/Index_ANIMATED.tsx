import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
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
import { NavigationIndicator } from '@/components/NavigationIndicator';
import { SwipeHint } from '@/components/SwipeHint';
import { PageTransition } from '@/components/PageTransition';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';

const Index = () => {
  const isMobile = useIsMobile();
  const [showSwipeHint, setShowSwipeHint] = useState(false);

  const routesConfig = [
    '/',
    '/camara-fria',
    '/camara-refrigerada',
    '/estoque-seco',
    '/descartaveis',
    '/configuracoes',
  ];

  const routeLabels = [
    'Dashboard',
    'Câmara Fria',
    'Câmara Refrigerada',
    'Estoque Seco',
    'Descartáveis',
    'Configurações',
  ];

  const {
    handlers,
    currentIndex,
    totalRoutes,
    navigateToIndex,
    canSwipeLeft,
    canSwipeRight,
  } = useSwipeNavigation({
    routes: routesConfig,
    enableSwipe: true,
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  // Mostrar dica de deslizamento na primeira visita
  useEffect(() => {
    const hasSeenSwipeHint = localStorage.getItem('hasSeenSwipeHint');
    if (!hasSeenSwipeHint && (canSwipeLeft || canSwipeRight)) {
      const timer = setTimeout(() => {
        setShowSwipeHint(true);
      }, 2000); // Mostrar após 2 segundos
      return () => clearTimeout(timer);
    }
  }, [canSwipeLeft, canSwipeRight]);

  const handleDismissSwipeHint = () => {
    setShowSwipeHint(false);
    localStorage.setItem('hasSeenSwipeHint', 'true');
  };

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div 
          className="min-h-screen flex w-full relative bg-churrasco-cream"
        >
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0 min-h-screen relative z-10">
            <Header />
            
            {/* Container unificado para navegação e conteúdo - sem bordas divisórias */}
            <div className="flex-1 flex flex-col bg-churrasco-cream">
              {/* Indicador de navegação integrado - visível apenas em mobile */}
              {isMobile && (
                <div className="bg-churrasco-cream pt-2 pb-1">
                  <NavigationIndicator
                    currentIndex={currentIndex}
                    totalRoutes={totalRoutes}
                    onNavigate={navigateToIndex}
                    routeLabels={routeLabels}
                    className="px-4"
                  />
                </div>
              )}

              {/* Conteúdo principal integrado com animações */}
              <main 
                {...handlers} 
                className="flex-1 p-4 md:p-6 relative overflow-hidden touch-pan-y select-none bg-churrasco-cream"
                style={{ 
                  touchAction: 'pan-y',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none'
                }}
              >
                <PageTransition className="relative z-10 max-w-full h-full">
                  <div className="h-full overflow-y-auto">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/camara-fria" element={<CamaraFria />} />
                      <Route path="/camara-refrigerada" element={<CamaraRefrigerada />} />
                      <Route path="/estoque-seco" element={<EstoqueSeco />} />
                      <Route path="/descartaveis" element={<Descartaveis />} />
                      <Route path="/configuracoes" element={<UserManagement />} />
                    </Routes>
                  </div>
                </PageTransition>
              </main>

              {/* Indicador de navegação inferior integrado - visível em desktop */}
              {!isMobile && (
                <div className="bg-churrasco-cream pt-1 pb-2">
                  <NavigationIndicator
                    currentIndex={currentIndex}
                    totalRoutes={totalRoutes}
                    onNavigate={navigateToIndex}
                    routeLabels={routeLabels}
                    className="px-6 py-2"
                  />
                </div>
              )}
            </div>

            {/* Dica de navegação por deslizamento */}
            <SwipeHint
              show={showSwipeHint}
              onDismiss={handleDismissSwipeHint}
              canSwipeLeft={canSwipeLeft}
              canSwipeRight={canSwipeRight}
            />
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
};

export default Index;

