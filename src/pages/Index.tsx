
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Header } from '@/components/Header';
import { Dashboard } from '@/components/Dashboard';
import CamaraFria from '@/components/CamaraFria';
import { CamaraRefrigerada } from '@/components/CamaraRefrigerada';
import EstoqueSeco from '@/components/EstoqueSeco';
import Descartaveis from '@/components/Descartaveis';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const Index = () => {
  return (
    <ProtectedRoute>
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-churrasco-cream via-background to-churrasco-cream/50">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <Header />
            <main className="flex-1 p-4 md:p-6 relative overflow-auto">
              <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
              <div className="relative z-10 max-w-full">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/camara-fria" element={<CamaraFria />} />
                  <Route path="/camara-refrigerada" element={<CamaraRefrigerada />} />
                  <Route path="/estoque-seco" element={<EstoqueSeco />} />
                  <Route path="/descartaveis" element={<Descartaveis />} />
                </Routes>
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
};

export default Index;
