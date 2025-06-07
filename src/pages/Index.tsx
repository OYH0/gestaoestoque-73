
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Header } from '@/components/Header';
import { Dashboard } from '@/components/Dashboard';
import { CamaraFria } from '@/components/CamaraFria';
import { CamaraRefrigerada } from '@/components/CamaraRefrigerada';
import { EstoqueSeco } from '@/components/EstoqueSeco';
import { Descartaveis } from '@/components/Descartaveis';
import { Login } from '@/components/Login';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const isMobile = useIsMobile();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-gradient-to-br from-churrasco-cream via-background to-churrasco-cream/50">
            <AppSidebar />
            <div className={`flex-1 flex flex-col ${isMobile ? '' : 'ml-80'}`}>
              <Header />
              <main className="flex-1 p-4 md:p-6 relative">
                <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
                <div className="relative z-10">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/camara-fria" element={<CamaraFria />} />
                    <Route path="/camara-refrigerada" element={<CamaraRefrigerada />} />
                    <Route path="/estoque-seco" element={<EstoqueSeco />} />
                    <Route path="/descartaveis" element={<Descartaveis />} />
                  </Routes>
                </div>
              </main>
            </div>
          </div>
        </SidebarProvider>
      } />
    </Routes>
  );
};

export default Index;
