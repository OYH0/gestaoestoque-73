
import { useEffect, useRef, useState } from 'react';
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
  const touchStartY = useRef<number>(0);
  const isScrolling = useRef<boolean>(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const getCurrentRouteIndex = () => {
    return routes.indexOf(location.pathname);
  };

  const navigateToRoute = (direction: 'next' | 'prev') => {
    const currentIndex = getCurrentRouteIndex();
    
    if (currentIndex === -1 || isAnimating) return;
    
    let newIndex;
    if (direction === 'next') {
      newIndex = currentIndex + 1;
      if (newIndex >= routes.length) newIndex = 0; // Volta para o início
      setSwipeDirection('left');
    } else {
      newIndex = currentIndex - 1;
      if (newIndex < 0) newIndex = routes.length - 1; // Vai para o final
      setSwipeDirection('right');
    }
    
    setIsAnimating(true);
    
    // Pequeno delay para permitir a animação antes da navegação
    setTimeout(() => {
      navigate(routes[newIndex]);
      setTimeout(() => {
        setIsAnimating(false);
        setSwipeDirection(null);
      }, 300);
    }, 150);
  };

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (isAnimating) return;
      touchStartX.current = e.changedTouches[0].screenX;
      touchStartY.current = e.changedTouches[0].screenY;
      touchEndX.current = touchStartX.current;
      isScrolling.current = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isAnimating) return;
      touchEndX.current = e.changedTouches[0].screenX;
      
      // Detectar se é scroll vertical (para não interferir com scroll normal)
      const deltaY = Math.abs(e.changedTouches[0].screenY - touchStartY.current);
      const deltaX = Math.abs(touchEndX.current - touchStartX.current);
      
      if (deltaY > deltaX) {
        isScrolling.current = true;
      }
    };

    const handleTouchEnd = () => {
      if (isScrolling.current || isAnimating) return;
      
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
      
      // Reset das variáveis de controle
      touchStartX.current = 0;
      touchEndX.current = 0;
      touchStartY.current = 0;
      isScrolling.current = false;
    };

    // Configurar event listeners uma única vez
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.addEventListener('touchstart', handleTouchStart, { passive: true });
      mainElement.addEventListener('touchmove', handleTouchMove, { passive: true });
      mainElement.addEventListener('touchend', handleTouchEnd, { passive: true });
      
      return () => {
        mainElement.removeEventListener('touchstart', handleTouchStart);
        mainElement.removeEventListener('touchmove', handleTouchMove);
        mainElement.removeEventListener('touchend', handleTouchEnd);
      };
    }

    return () => {};
  }, [location.pathname, navigate, isAnimating]);

  return {
    currentRoute: location.pathname,
    currentIndex: getCurrentRouteIndex(),
    totalRoutes: routes.length,
    navigateNext: () => navigateToRoute('next'),
    navigatePrev: () => navigateToRoute('prev'),
    isAnimating,
    swipeDirection
  };
}
