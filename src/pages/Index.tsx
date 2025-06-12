
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

const Index = () => {
  const isMobile = useIsMobile();

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-churrasco-wallpaper relative overflow-hidden">
          {/* Custom wallpaper background */}
          <div className="absolute inset-0 bg-churrasco-wallpaper-overlay opacity-95" />
          <div className="absolute inset-0 bg-churrasco-pattern opacity-20" />
          
          {/* Floating decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-churrasco-red/10 to-churrasco-orange/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-1/3 -left-32 w-80 h-80 bg-gradient-to-tr from-churrasco-brown/8 to-churrasco-red/8 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-32 right-1/4 w-72 h-72 bg-gradient-to-bl from-churrasco-orange/12 to-churrasco-cream/15 rounded-full blur-3xl"></div>
            
            {/* Additional small decorative elements */}
            <div className="absolute top-20 left-1/4 w-4 h-4 bg-churrasco-red/20 rounded-full animate-ping" style={{ animationDelay: '2s', animationDuration: '3s' }}></div>
            <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-churrasco-orange/25 rounded-full animate-ping" style={{ animationDelay: '4s', animationDuration: '4s' }}></div>
            <div className="absolute top-2/3 left-1/6 w-2 h-2 bg-churrasco-brown/30 rounded-full animate-ping" style={{ animationDelay: '1s', animationDuration: '5s' }}></div>
          </div>

          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0 h-screen relative z-10">
            <Header />
            <main className="flex-1 p-4 md:p-6 relative overflow-auto">
              <div className="absolute inset-0 bg-grid-pattern opacity-15 pointer-events-none" />
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
