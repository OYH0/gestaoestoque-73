
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
  const cleanupRef = useRef<(() => void) | null>(null);

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
    
    console.log('New index calculated:', newIndex, 'New route:', routes[newIndex]);
    
    setIsAnimating(true);
    
    setTimeout(() => {
      navigate(routes[newIndex]);
      setTimeout(() => {
        setIsAnimating(false);
        setSwipeDirection(null);
      }, 300);
    }, 150);
  };

  // Funções de controle de touch separadas para evitar problemas de referência
  const handleTouchStart = useRef((e: TouchEvent) => {
    if (isAnimating) return;
    console.log('Touch start detected');
    touchStartX.current = e.changedTouches[0].screenX;
    touchStartY.current = e.changedTouches[0].screenY;
    touchEndX.current = touchStartX.current;
    isScrolling.current = false;
  });

  const handleTouchMove = useRef((e: TouchEvent) => {
    if (isAnimating) return;
    touchEndX.current = e.changedTouches[0].screenX;
    
    const deltaY = Math.abs(e.changedTouches[0].screenY - touchStartY.current);
    const deltaX = Math.abs(touchEndX.current - touchStartX.current);
    
    if (deltaY > deltaX) {
      isScrolling.current = true;
    }
  });

  const handleTouchEnd = useRef(() => {
    if (isScrolling.current || isAnimating) return;
    
    const swipeDistance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;
    
    console.log('Touch end:', { swipeDistance, minSwipeDistance, touchStartX: touchStartX.current, touchEndX: touchEndX.current });
    
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
  });

  useEffect(() => {
    // Limpar listeners existentes se houver
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    const setupEventListeners = () => {
      setTimeout(() => {
        const mainElement = document.querySelector('main');
        console.log('Setting up event listeners, main element found:', !!mainElement);
        
        if (mainElement && !listenersAttached.current) {
          console.log('Attaching event listeners');
          
          mainElement.addEventListener('touchstart', handleTouchStart.current, { passive: true });
          mainElement.addEventListener('touchmove', handleTouchMove.current, { passive: true });
          mainElement.addEventListener('touchend', handleTouchEnd.current, { passive: true });
          
          listenersAttached.current = true;
          
          // Retornar função de cleanup
          cleanupRef.current = () => {
            console.log('Cleaning up event listeners');
            if (mainElement) {
              mainElement.removeEventListener('touchstart', handleTouchStart.current);
              mainElement.removeEventListener('touchmove', handleTouchMove.current);
              mainElement.removeEventListener('touchend', handleTouchEnd.current);
            }
            listenersAttached.current = false;
          };
        }
      }, 100);
    };

    setupEventListeners();
    
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [location.pathname]);

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
