
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
    const index = routes.indexOf(location.pathname);
    console.log('Current route:', location.pathname, 'Index:', index);
    return index;
  };

  const navigateToRoute = (direction: 'next' | 'prev') => {
    const currentIndex = getCurrentRouteIndex();
    
    console.log('Navigate called:', { direction, currentIndex, currentRoute: location.pathname, isAnimating });
    
    if (currentIndex === -1 || isAnimating) {
      console.log('Navigation blocked:', { currentIndex, isAnimating });
      return;
    }
    
    let newIndex;
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % routes.length; // Navegação circular para frente
      setSwipeDirection('left');
    } else {
      newIndex = currentIndex - 1;
      if (newIndex < 0) newIndex = routes.length - 1; // Vai para o final se estiver no início
      setSwipeDirection('right');
    }
    
    console.log('New index calculated:', newIndex, 'New route:', routes[newIndex]);
    
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
      
      console.log('Touch end:', { swipeDistance, minSwipeDistance, touchStartX: touchStartX.current, touchEndX: touchEndX.current });
      
      if (Math.abs(swipeDistance) > minSwipeDistance) {
        if (swipeDistance > 0) {
          // Swipe para a esquerda = próxima aba
          console.log('Swipe left detected - going to next');
          navigateToRoute('next');
        } else {
          // Swipe para a direita = aba anterior
          console.log('Swipe right detected - going to prev');
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
