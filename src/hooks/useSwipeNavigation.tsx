import { useNavigate, useLocation } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import { useCallback } from 'react';

export interface SwipeNavigationConfig {
  routes: string[];
  enableSwipe?: boolean;
  preventScrollOnSwipe?: boolean;
  trackMouse?: boolean;
}

export const useSwipeNavigation = (config: SwipeNavigationConfig) => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    routes,
    enableSwipe = true,
    preventScrollOnSwipe = true,
    trackMouse = true,
  } = config;

  const getCurrentIndex = useCallback(() => {
    return routes.indexOf(location.pathname);
  }, [routes, location.pathname]);

  const navigateToIndex = useCallback((index: number) => {
    if (index >= 0 && index < routes.length) {
      navigate(routes[index]);
    }
  }, [navigate, routes]);

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    if (!enableSwipe) return;

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
  }, [enableSwipe, getCurrentIndex, navigateToIndex, routes.length]);

  const handlers = useSwipeable({
    onSwipedLeft: () => handleSwipe('left'),
    onSwipedRight: () => handleSwipe('right'),
    preventScrollOnSwipe,
    trackMouse,
  });

  return {
    handlers: enableSwipe ? handlers : {},
    currentIndex: getCurrentIndex(),
    totalRoutes: routes.length,
    navigateToIndex,
    canSwipeLeft: getCurrentIndex() < routes.length - 1,
    canSwipeRight: getCurrentIndex() > 0,
  };
};

