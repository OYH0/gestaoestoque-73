
import React from 'react';
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
import { useIsMobile } from '@/hooks/use-mobile';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';

const Index = () => {
  const isMobile = useIsMobile();
  
  // Inicializar o hook de navegação por swipe
  const { isAnimating, swipeDirection } = useSwipeNavigation();

  const getAnimationClass = () => {
    if (!isAnimating && !swipeDirection) return 'animate-fade-in';
    
    if (isAnimating) {
      if (swipeDirection === 'left') {
        return 'animate-slide-out-left';
      } else if (swipeDirection === 'right') {
        return 'animate-slide-out-right';
      }
    } else if (swipeDirection) {
      // Animação de entrada após a navegação
      if (swipeDirection === 'left') {
        return 'animate-slide-in-left';
      } else if (swipeDirection === 'right') {
        return 'animate-slide-in-right';
      }
    }
    
    return 'animate-fade-in';
  };

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div 
          className="min-h-screen flex w-full relative overflow-hidden bg-churrasco-cream"
        >
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0 h-screen relative z-10">
            <Header />
            <main className="flex-1 p-4 md:p-6 relative overflow-hidden">
              <div className={`relative z-10 max-w-full transition-all duration-400 ${getAnimationClass()}`}>
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
