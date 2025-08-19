import { useEffect, useState, useRef } from 'react';

/**
 * Hook personalizado para animaciones en scroll
 * Optimizado para rendimiento usando Intersection Observer
 * Incluye throttling para mejor UX en dispositivos menos potentes
 */

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  delay?: number;
}

interface ScrollAnimationState {
  isVisible: boolean;
  hasTriggered: boolean;
  entry: IntersectionObserverEntry | null;
}

/**
 * Hook principal para animaciones basadas en scroll
 */
export const useScrollAnimation = (options: UseScrollAnimationOptions = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -100px 0px',
    triggerOnce = true,
    delay = 0
  } = options;

  const [state, setState] = useState<ScrollAnimationState>({
    isVisible: false,
    hasTriggered: false,
    entry: null
  });

  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Verificar soporte del browser
    if (!window.IntersectionObserver) {
      // Fallback para browsers sin soporte
      setState(prev => ({
        ...prev,
        isVisible: true,
        hasTriggered: true
      }));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        
        const shouldTrigger = entry.isIntersecting;
        const shouldNotTriggerAgain = triggerOnce && state.hasTriggered;

        if (shouldTrigger && !shouldNotTriggerAgain) {
          // Aplicar delay si está configurado
          const timeoutId = setTimeout(() => {
            setState(prev => ({
              ...prev,
              isVisible: true,
              hasTriggered: true,
              entry
            }));
          }, delay);

          return () => clearTimeout(timeoutId);
        } else if (!triggerOnce && !shouldTrigger) {
          // Permitir que se oculte de nuevo si triggerOnce es false
          setState(prev => ({
            ...prev,
            isVisible: false,
            entry
          }));
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce, delay, state.hasTriggered]);

  return {
    elementRef,
    isVisible: state.isVisible,
    hasTriggered: state.hasTriggered,
    entry: state.entry
  };
};

/**
 * Hook para animaciones escalonadas en listas
 */
export const useStaggeredAnimation = (
  itemCount: number,
  baseDelay: number = 100,
  options: UseScrollAnimationOptions = {}
) => {
  const { elementRef, isVisible } = useScrollAnimation(options);
  const [visibleItems, setVisibleItems] = useState<boolean[]>(
    new Array(itemCount).fill(false)
  );

  useEffect(() => {
    if (isVisible) {
      // Mostrar elementos uno por uno con delay escalonado
      const timeouts: NodeJS.Timeout[] = [];
      
      for (let i = 0; i < itemCount; i++) {
        const timeout = setTimeout(() => {
          setVisibleItems(prev => {
            const newState = [...prev];
            newState[i] = true;
            return newState;
          });
        }, i * baseDelay);
        
        timeouts.push(timeout);
      }

      return () => {
        timeouts.forEach(timeout => clearTimeout(timeout));
      };
    }
  }, [isVisible, itemCount, baseDelay]);

  return {
    containerRef: elementRef,
    visibleItems,
    isContainerVisible: isVisible
  };
};

/**
 * Hook para efectos de parallax suave
 */
export const useParallax = (speed: number = 0.5) => {
  const [scrollY, setScrollY] = useState(0);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let ticking = false;

    const updateScrollY = () => {
      setScrollY(window.scrollY);
      ticking = false;
    };

    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollY);
        ticking = true;
      }
    };

    const handleScroll = () => requestTick();

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const parallaxStyle = {
    transform: `translateY(${scrollY * speed}px)`,
    // Optimización para mejor rendimiento
    willChange: 'transform',
    backfaceVisibility: 'hidden' as const,
  };

  return {
    elementRef,
    parallaxStyle,
    scrollY
  };
};

/**
 * Hook para contador animado
 */
export const useCountUp = (
  end: number,
  duration: number = 2000,
  startOnVisible: boolean = true
) => {
  const [count, setCount] = useState(0);
  const { elementRef, isVisible } = useScrollAnimation();

  useEffect(() => {
    if (!startOnVisible || isVisible) {
      const startTime = Date.now();
      const startValue = 0;

      const updateCount = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Función de easing suave
        const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
        const easedProgress = easeOutCubic(progress);

        const currentCount = Math.floor(startValue + (end - startValue) * easedProgress);
        setCount(currentCount);

        if (progress < 1) {
          requestAnimationFrame(updateCount);
        }
      };

      const timeoutId = setTimeout(updateCount, 100); // Pequeño delay para mejor UX
      return () => clearTimeout(timeoutId);
    }
  }, [end, duration, isVisible, startOnVisible]);

  return {
    elementRef,
    count,
    isAnimating: count < end
  };
};

/**
 * Hook para detectar si el usuario prefiere movimiento reducido
 */
export const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
};
