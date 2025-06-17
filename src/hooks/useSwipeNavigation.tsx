
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
  const touchStartY = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const touchEndY = useRef<number>(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const getCurrentRouteIndex = () => {
    const index = routes.indexOf(location.pathname);
    console.log('Current route:', location.pathname, 'Index:', index);
    return index === -1 ? 0 : index;
  };

  const navigateToRoute = (direction: 'next' | 'prev') => {
    if (isAnimating) {
      console.log('Navigation blocked: animating');
      return;
    }
    
    const currentIndex = getCurrentRouteIndex();
    console.log('Navigate called:', { direction, currentIndex, currentRoute: location.pathname });
    
    let newIndex;
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % routes.length;
      setSwipeDirection('left');
    } else {
      newIndex = currentIndex - 1;
      if (newIndex < 0) {
        newIndex = routes.length - 1;
      }
      setSwipeDirection('right');
    }
    
    console.log('Navigating from index', currentIndex, 'to index', newIndex, 'Route:', routes[newIndex]);
    
    setIsAnimating(true);
    navigate(routes[newIndex]);
    
    setTimeout(() => {
      setIsAnimating(false);
      setSwipeDirection(null);
    }, 300);
  };

  const handleTouchStart = (e: TouchEvent) => {
    if (isAnimating) return;
    
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    touchEndX.current = touch.clientX;
    touchEndY.current = touch.clientY;
    
    console.log('Touch start:', { x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isAnimating) return;
    
    const touch = e.touches[0];
    touchEndX.current = touch.clientX;
    touchEndY.current = touch.clientY;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (isAnimating) return;
    
    const deltaX = touchStartX.current - touchEndX.current;
    const deltaY = touchStartY.current - touchEndY.current;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    
    console.log('Touch end:', { 
      deltaX, 
      deltaY, 
      absDeltaX, 
      absDeltaY,
      startX: touchStartX.current,
      startY: touchStartY.current,
      endX: touchEndX.current,
      endY: touchEndY.current
    });
    
    // Constantes para detecção de swipe
    const minSwipeDistance = 50;
    const maxVerticalMovement = 100;
    
    // Verificar se é um movimento horizontal significativo
    const isHorizontalSwipe = absDeltaX > minSwipeDistance && absDeltaX > absDeltaY;
    const isVerticalMovement = absDeltaY > maxVerticalMovement;
    
    console.log('Swipe analysis:', {
      isHorizontalSwipe,
      isVerticalMovement,
      minSwipeDistance,
      maxVerticalMovement
    });
    
    // Só processar navegação se for claramente um swipe horizontal
    // e não houver movimento vertical excessivo
    if (isHorizontalSwipe && !isVerticalMovement) {
      console.log('Valid horizontal swipe detected');
      
      if (deltaX > 0) {
        // Swipe da direita para esquerda = próxima página
        console.log('Swipe left detected - going to next');
        navigateToRoute('next');
      } else {
        // Swipe da esquerda para direita = página anterior
        console.log('Swipe right detected - going to prev');
        navigateToRoute('prev');
      }
    } else {
      console.log('Not a valid swipe - allowing normal scroll behavior');
    }
    
    // Reset dos valores
    touchStartX.current = 0;
    touchStartY.current = 0;
    touchEndX.current = 0;
    touchEndY.current = 0;
  };

  useEffect(() => {
    // Limpar listeners anteriores
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    // Aguardar o DOM estar pronto
    const timer = setTimeout(() => {
      const mainElement = document.querySelector('main');
      console.log('Setting up swipe listeners, main element found:', !!mainElement);
      
      if (mainElement) {
        console.log('Attaching swipe listeners for route:', location.pathname);
        
        // Usar passive: true para não interferir com scroll nativo
        mainElement.addEventListener('touchstart', handleTouchStart, { passive: true });
        mainElement.addEventListener('touchmove', handleTouchMove, { passive: true });
        mainElement.addEventListener('touchend', handleTouchEnd, { passive: true });
        
        // Função de cleanup
        cleanupRef.current = () => {
          console.log('Cleaning up swipe listeners');
          mainElement.removeEventListener('touchstart', handleTouchStart);
          mainElement.removeEventListener('touchmove', handleTouchMove);
          mainElement.removeEventListener('touchend', handleTouchEnd);
        };
      }
    }, 100);
    
    return () => {
      clearTimeout(timer);
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
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
