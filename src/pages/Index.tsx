
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
        <div 
          className="min-h-screen flex w-full relative overflow-hidden"
          style={{
            background: `
              linear-gradient(
                135deg,
                #f5f3f0 0%,
                rgba(245, 243, 240, 0.9) 25%,
                #faf8f5 50%,
                rgba(245, 243, 240, 0.8) 75%,
                rgba(245, 243, 240, 0.6) 100%
              )
            `,
          }}
        >
          {/* Custom wallpaper overlay */}
          <div 
            className="absolute inset-0 opacity-95"
            style={{
              background: `
                radial-gradient(
                  ellipse at center,
                  transparent 0%,
                  rgba(245, 243, 240, 0.1) 35%,
                  rgba(221, 95, 41, 0.05) 70%,
                  rgba(101, 70, 41, 0.1) 100%
                )
              `,
            }}
          />
          
          {/* Pattern overlay */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                repeating-linear-gradient(
                  45deg,
                  transparent 0px,
                  transparent 4px,
                  rgba(101, 70, 41, 0.03) 4px,
                  rgba(101, 70, 41, 0.03) 8px
                ),
                repeating-linear-gradient(
                  -45deg,
                  transparent 0px,
                  transparent 4px,
                  rgba(221, 95, 41, 0.02) 4px,
                  rgba(221, 95, 41, 0.02) 8px
                ),
                radial-gradient(
                  circle at 25% 25%,
                  rgba(231, 139, 69, 0.05) 1px,
                  transparent 1px
                ),
                radial-gradient(
                  circle at 75% 75%,
                  rgba(101, 70, 41, 0.03) 1px,
                  transparent 1px
                )
              `,
              backgroundSize: '40px 40px, 40px 40px, 60px 60px, 80px 80px',
              backgroundPosition: '0 0, 0 0, 30px 30px, 40px 40px',
            }}
          />
          
          {/* Floating decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div 
              className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl animate-pulse"
              style={{
                background: 'linear-gradient(to bottom right, rgba(221, 95, 41, 0.1), rgba(231, 139, 69, 0.1))',
              }}
            ></div>
            <div 
              className="absolute top-1/3 -left-32 w-80 h-80 rounded-full blur-3xl"
              style={{
                background: 'linear-gradient(to top right, rgba(101, 70, 41, 0.08), rgba(221, 95, 41, 0.08))',
              }}
            ></div>
            <div 
              className="absolute -bottom-32 right-1/4 w-72 h-72 rounded-full blur-3xl"
              style={{
                background: 'linear-gradient(to bottom left, rgba(231, 139, 69, 0.12), rgba(245, 243, 240, 0.15))',
              }}
            ></div>
            
            {/* Additional small decorative elements */}
            <div 
              className="absolute top-20 left-1/4 w-4 h-4 rounded-full animate-ping"
              style={{ 
                backgroundColor: 'rgba(221, 95, 41, 0.2)',
                animationDelay: '2s', 
                animationDuration: '3s' 
              }}
            ></div>
            <div 
              className="absolute bottom-1/3 right-1/3 w-3 h-3 rounded-full animate-ping"
              style={{ 
                backgroundColor: 'rgba(231, 139, 69, 0.25)',
                animationDelay: '4s', 
                animationDuration: '4s' 
              }}
            ></div>
            <div 
              className="absolute top-2/3 left-1/6 w-2 h-2 rounded-full animate-ping"
              style={{ 
                backgroundColor: 'rgba(101, 70, 41, 0.3)',
                animationDelay: '1s', 
                animationDuration: '5s' 
              }}
            ></div>
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
