import React, { useRef, useEffect, useState } from 'react';
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
  const [direction, setDirection] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Definir rotas e suas ordens para determinar direção
  const routes = [
    '/',
    '/camara-fria',
    '/camara-refrigerada',
    '/estoque-seco',
    '/descartaveis',
    '/configuracoes',
  ];

  useEffect(() => {
    const currentIndex = routes.indexOf(location.pathname);
    const prevIndex = routes.indexOf(prevLocationRef.current);
    
    if (currentIndex !== -1 && prevIndex !== -1) {
      const newDirection = currentIndex > prevIndex ? 1 : -1;
      setDirection(newDirection);
      setIsAnimating(true);
      
      // Aplicar classe de animação
      if (containerRef.current) {
        const isMobile = window.innerWidth < 768;
        
        if (isMobile) {
          // Animação de slide para mobile
          containerRef.current.style.transform = `translateX(${newDirection > 0 ? '100%' : '-100%'})`;
          containerRef.current.style.opacity = '0';
          
          // Forçar reflow
          containerRef.current.offsetHeight;
          
          // Animar para posição final
          containerRef.current.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease';
          containerRef.current.style.transform = 'translateX(0)';
          containerRef.current.style.opacity = '1';
        } else {
          // Animação de fade para desktop
          containerRef.current.style.opacity = '0';
          containerRef.current.style.transform = 'scale(0.95)';
          
          // Forçar reflow
          containerRef.current.offsetHeight;
          
          // Animar para posição final
          containerRef.current.style.transition = 'opacity 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
          containerRef.current.style.opacity = '1';
          containerRef.current.style.transform = 'scale(1)';
        }
        
        // Limpar animação após conclusão
        const timeout = setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.style.transition = '';
            containerRef.current.style.transform = '';
            containerRef.current.style.opacity = '';
          }
          setIsAnimating(false);
        }, isMobile ? 300 : 400);
        
        return () => clearTimeout(timeout);
      }
    }
    
    prevLocationRef.current = location.pathname;
  }, [location.pathname, routes]);

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

