
import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Ordem das rotas para navegação sequencial
const routes = [
  '/',
  '/camara-fria',
  '/camara-refrigerada',
  '/estoque-seco',
  '/descartaveis',
  '/configuracoes'
];

export function useSwipeNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const isScrolling = useRef<boolean>(false);

  const getCurrentRouteIndex = () => {
    return routes.indexOf(location.pathname);
  };

  const navigateToRoute = (direction: 'next' | 'prev') => {
    const currentIndex = getCurrentRouteIndex();
    
    if (currentIndex === -1) return;
    
    let newIndex;
    if (direction === 'next') {
      newIndex = currentIndex + 1;
      if (newIndex >= routes.length) newIndex = 0; // Volta para o início
    } else {
      newIndex = currentIndex - 1;
      if (newIndex < 0) newIndex = routes.length - 1; // Vai para o final
    }
    
    navigate(routes[newIndex]);
  };

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.changedTouches[0].screenX;
      touchEndX.current = touchStartX.current;
      isScrolling.current = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      touchEndX.current = e.changedTouches[0].screenX;
      
      // Detectar se é scroll vertical (para não interferir com scroll normal)
      const deltaY = Math.abs(e.changedTouches[0].screenY - e.changedTouches[0].screenY);
      const deltaX = Math.abs(touchEndX.current - touchStartX.current);
      
      if (deltaY > deltaX) {
        isScrolling.current = true;
      }
    };

    const handleTouchEnd = () => {
      if (isScrolling.current) return;
      
      const swipeDistance = touchStartX.current - touchEndX.current;
      const minSwipeDistance = 50; // Distância mínima para considerar um swipe
      
      if (Math.abs(swipeDistance) > minSwipeDistance) {
        if (swipeDistance > 0) {
          // Swipe para a esquerda = próxima aba
          navigateToRoute('next');
        } else {
          // Swipe para a direita = aba anterior
          navigateToRoute('prev');
        }
      }
    };

    // Adicionar eventos de touch apenas no elemento principal
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.addEventListener('touchstart', handleTouchStart, { passive: true });
      mainElement.addEventListener('touchmove', handleTouchMove, { passive: true });
      mainElement.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    return () => {
      if (mainElement) {
        mainElement.removeEventListener('touchstart', handleTouchStart);
        mainElement.removeEventListener('touchmove', handleTouchMove);
        mainElement.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [location.pathname, navigate]);

  return {
    currentRoute: location.pathname,
    currentIndex: getCurrentRouteIndex(),
    totalRoutes: routes.length,
    navigateNext: () => navigateToRoute('next'),
    navigatePrev: () => navigateToRoute('prev')
  };
}
