import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  className = '' 
}) => {
  const location = useLocation();
  const prevLocationRef = useRef(location.pathname);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Memoizar rotas para evitar recriação
  const routes = useMemo(() => [
    '/',
    '/camara-fria',
    '/camara-refrigerada',
    '/estoque-seco',
    '/descartaveis',
    '/configuracoes',
  ], []);

  useEffect(() => {
    // Verificar se realmente houve mudança de rota
    if (prevLocationRef.current === location.pathname) {
      return;
    }

    const currentIndex = routes.indexOf(location.pathname);
    const prevIndex = routes.indexOf(prevLocationRef.current);
    
    // Só animar se ambas as rotas existem e são diferentes
    if (currentIndex !== -1 && prevIndex !== -1 && currentIndex !== prevIndex) {
      const newDirection = currentIndex > prevIndex ? 1 : -1;
      setIsAnimating(true);
      
      // Limpar timeout anterior se existir
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Aplicar animação
      if (containerRef.current) {
        const isMobile = window.innerWidth < 768;
        const element = containerRef.current;
        
        if (isMobile) {
          // Animação de slide para mobile
          element.style.transform = `translateX(${newDirection > 0 ? '100%' : '-100%'})`;
          element.style.opacity = '0';
          
          // Forçar reflow
          element.offsetHeight;
          
          // Animar para posição final
          element.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease';
          element.style.transform = 'translateX(0)';
          element.style.opacity = '1';
          
          // Limpar após animação
          timeoutRef.current = setTimeout(() => {
            if (element) {
              element.style.transition = '';
              element.style.transform = '';
              element.style.opacity = '';
            }
            setIsAnimating(false);
          }, 350);
        } else {
          // Animação de fade para desktop
          element.style.opacity = '0';
          element.style.transform = 'scale(0.95)';
          
          // Forçar reflow
          element.offsetHeight;
          
          // Animar para posição final
          element.style.transition = 'opacity 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
          element.style.opacity = '1';
          element.style.transform = 'scale(1)';
          
          // Limpar após animação
          timeoutRef.current = setTimeout(() => {
            if (element) {
              element.style.transition = '';
              element.style.transform = '';
              element.style.opacity = '';
            }
            setIsAnimating(false);
          }, 450);
        }
      }
    }
    
    // Atualizar referência da rota anterior
    prevLocationRef.current = location.pathname;
  }, [location.pathname, routes]);

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full page-transition-optimized ${className}`}
      style={{
        willChange: isAnimating ? 'transform, opacity' : 'auto',
      }}
    >
      {children}
    </div>
  );
};

// Hook para controlar animações baseadas em gestos
export const usePageTransition = () => {
  const location = useLocation();
  
  return {
    key: location.pathname,
    pathname: location.pathname,
  };
};

