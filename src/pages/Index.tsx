
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

const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-4 md:p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/camara-fria" element={<CamaraFria />} />
              <Route path="/camara-refrigerada" element={<CamaraRefrigerada />} />
              <Route path="/estoque-seco" element={<EstoqueSeco />} />
              <Route path="/descartaveis" element={<Descartaveis />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
