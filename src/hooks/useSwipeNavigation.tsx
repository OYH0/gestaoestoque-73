
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
  const listenersAttached = useRef<boolean>(false);

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
      newIndex = (currentIndex + 1) % routes.length;
      setSwipeDirection('left');
    } else {
      newIndex = currentIndex - 1;
      if (newIndex < 0) newIndex = routes.length - 1;
      setSwipeDirection('right');
    }
    
    console.log('Navigating from index', currentIndex, 'to index', newIndex, 'Route:', routes[newIndex]);
    
    setIsAnimating(true);
    
    setTimeout(() => {
      navigate(routes[newIndex]);
      setTimeout(() => {
        setIsAnimating(false);
        setSwipeDirection(null);
      }, 300);
    }, 150);
  };

  const handleTouchStart = (e: TouchEvent) => {
    if (isAnimating) return;
    console.log('Touch start detected');
    touchStartX.current = e.changedTouches[0].screenX;
    touchStartY.current = e.changedTouches[0].screenY;
    touchEndX.current = touchStartX.current;
    isScrolling.current = false;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isAnimating) return;
    touchEndX.current = e.changedTouches[0].screenX;
    
    const deltaY = Math.abs(e.changedTouches[0].screenY - touchStartY.current);
    const deltaX = Math.abs(touchEndX.current - touchStartX.current);
    
    if (deltaY > deltaX && deltaY > 10) {
      isScrolling.current = true;
    }
  };

  const handleTouchEnd = () => {
    if (isScrolling.current || isAnimating) return;
    
    const swipeDistance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;
    
    console.log('Touch end:', { 
      swipeDistance, 
      minSwipeDistance, 
      touchStartX: touchStartX.current, 
      touchEndX: touchEndX.current,
      currentRoute: location.pathname,
      currentIndex: getCurrentRouteIndex()
    });
    
    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        console.log('Swipe left detected - going to next');
        navigateToRoute('next');
      } else {
        console.log('Swipe right detected - going to prev');
        navigateToRoute('prev');
      }
    }
    
    // Reset
    touchStartX.current = 0;
    touchEndX.current = 0;
    touchStartY.current = 0;
    isScrolling.current = false;
  };

  useEffect(() => {
    const setupEventListeners = () => {
      // Aguardar o DOM estar pronto
      const timer = setTimeout(() => {
        const mainElement = document.querySelector('main');
        console.log('Setting up event listeners, main element found:', !!mainElement);
        
        if (mainElement && !listenersAttached.current) {
          console.log('Attaching event listeners for route:', location.pathname);
          
          // Remover listeners existentes para evitar duplicação
          mainElement.removeEventListener('touchstart', handleTouchStart);
          mainElement.removeEventListener('touchmove', handleTouchMove);
          mainElement.removeEventListener('touchend', handleTouchEnd);
          
          // Adicionar novos listeners
          mainElement.addEventListener('touchstart', handleTouchStart, { passive: true });
          mainElement.addEventListener('touchmove', handleTouchMove, { passive: true });
          mainElement.addEventListener('touchend', handleTouchEnd, { passive: true });
          
          listenersAttached.current = true;
        }
      }, 100);
      
      return () => {
        clearTimeout(timer);
      };
    };

    const cleanup = setupEventListeners();
    
    return () => {
      cleanup();
      // Cleanup listeners ao desmontar
      const mainElement = document.querySelector('main');
      if (mainElement && listenersAttached.current) {
        console.log('Cleaning up event listeners');
        mainElement.removeEventListener('touchstart', handleTouchStart);
        mainElement.removeEventListener('touchmove', handleTouchMove);
        mainElement.removeEventListener('touchend', handleTouchEnd);
        listenersAttached.current = false;
      }
    };
  }, [location.pathname, isAnimating]);

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
