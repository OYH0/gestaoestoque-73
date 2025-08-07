
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import { useCallback, useRef, useState } from 'react';

export interface SwipeNavigationConfig {
  routes: string[];
  enableSwipe?: boolean;
  preventScrollOnSwipe?: boolean;
  trackMouse?: boolean;
  onNavigationStart?: () => void;
  onNavigationEnd?: () => void;
}

export const useSwipeNavigation = (config: SwipeNavigationConfig) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);
  const navigationTimeoutRef = useRef<NodeJS.Timeout>();

  const {
    routes,
    enableSwipe = true,
    preventScrollOnSwipe = true,
    trackMouse = true,
    onNavigationStart,
    onNavigationEnd,
  } = config;

  const getCurrentIndex = useCallback(() => {
    return routes.indexOf(location.pathname);
  }, [routes, location.pathname]);

  const navigateToIndex = useCallback((index: number) => {
    if (index >= 0 && index < routes.length && !isNavigating) {
      setIsNavigating(true);
      onNavigationStart?.();
      
      // Limpar timeout anterior se existir
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
      
      navigate(routes[index]);
      
      // Resetar estado após animação - reduzido para melhor performance
      navigationTimeoutRef.current = setTimeout(() => {
        setIsNavigating(false);
        onNavigationEnd?.();
      }, 200); // Reduzido de 400ms para 200ms
    }
  }, [navigate, routes, isNavigating, onNavigationStart, onNavigationEnd]);

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    if (!enableSwipe || isNavigating) return;

    const currentIndex = getCurrentIndex();
    let nextIndex = -1;

    if (direction === 'left') {
      // Deslizar para esquerda vai para próxima aba
      nextIndex = (currentIndex + 1) % routes.length;
    } else if (direction === 'right') {
      // Deslizar para direita vai para aba anterior
      nextIndex = (currentIndex - 1 + routes.length) % routes.length;
    }

    if (nextIndex !== -1) {
      navigateToIndex(nextIndex);
    }
  }, [enableSwipe, isNavigating, getCurrentIndex, navigateToIndex, routes.length]);

  const handlers = useSwipeable({
    onSwipedLeft: () => handleSwipe('left'),
    onSwipedRight: () => handleSwipe('right'),
    preventScrollOnSwipe,
    trackMouse,
    swipeDuration: 300, // Reduzido para melhor responsividade
    trackTouch: true,
    delta: 60, // Menor sensibilidade para evitar gestos acidentais
  });

  // Navegação por teclado
  const handleKeyNavigation = useCallback((event: KeyboardEvent) => {
    if (isNavigating) return;
    
    if (event.key === 'ArrowLeft' && event.ctrlKey) {
      event.preventDefault();
      handleSwipe('right');
    } else if (event.key === 'ArrowRight' && event.ctrlKey) {
      event.preventDefault();
      handleSwipe('left');
    }
  }, [handleSwipe, isNavigating]);

  // Adicionar listener de teclado
  React.useEffect(() => {
    if (enableSwipe) {
      window.addEventListener('keydown', handleKeyNavigation);
      return () => window.removeEventListener('keydown', handleKeyNavigation);
    }
  }, [enableSwipe, handleKeyNavigation]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  return {
    handlers: enableSwipe ? handlers : {},
    currentIndex: getCurrentIndex(),
    totalRoutes: routes.length,
    navigateToIndex,
    canSwipeLeft: getCurrentIndex() < routes.length - 1,
    canSwipeRight: getCurrentIndex() > 0,
    isNavigating,
  };
};
