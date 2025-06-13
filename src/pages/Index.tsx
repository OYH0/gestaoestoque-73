
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
        <div className="h-screen flex relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" style={{ height: '100dvh' }}>
          {/* Animated background elements */}
          <div className="absolute inset-0">
            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-churrasco-red/20 via-transparent to-churrasco-orange/20"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-900"></div>
            
            {/* Floating geometric shapes */}
            <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-churrasco-red/30 to-churrasco-orange/30 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute top-1/3 right-20 w-48 h-48 bg-gradient-to-tr from-churrasco-brown/20 to-churrasco-red/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-gradient-to-bl from-churrasco-orange/25 to-churrasco-cream/20 rounded-full blur-lg animate-pulse" style={{ animationDelay: '4s' }}></div>
            
            {/* Subtle grid pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="w-full h-full bg-grid-pattern"></div>
            </div>
          </div>

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
