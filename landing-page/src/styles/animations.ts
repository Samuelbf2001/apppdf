import { keyframes } from '@emotion/react';

/**
 * Animaciones personalizadas para la landing page
 * Diseñadas para mejorar la experiencia visual y el engagement
 * Optimizadas para rendimiento y accesibilidad
 */

// Animación de entrada suave desde abajo
export const slideUpAnimation = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Animación de entrada desde la izquierda
export const slideInLeftAnimation = keyframes`
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

// Animación de entrada desde la derecha
export const slideInRightAnimation = keyframes`
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

// Animación de fade in suave
export const fadeInAnimation = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

// Animación de escala suave
export const scaleInAnimation = keyframes`
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

// Animación de pulso para elementos destacados
export const pulseAnimation = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
`;

// Animación de flotación suave
export const floatAnimation = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

// Animación de brillo para botones
export const shimmerAnimation = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

// Animación de rotación suave
export const rotateAnimation = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// Configuraciones de timing predefinidas
export const animationTimings = {
  fast: '0.3s ease-out',
  normal: '0.5s ease-out',
  slow: '0.8s ease-out',
  bounce: '0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  spring: '0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
};

// Media queries para animaciones responsivas
export const responsiveAnimations = {
  // Reducir movimiento para usuarios que lo prefieran
  reduceMotion: '@media (prefers-reduced-motion: reduce)',
  
  // Animaciones específicas para móvil
  mobile: '@media (max-width: 768px)',
  
  // Animaciones específicas para desktop
  desktop: '@media (min-width: 769px)'
};

// Utilidades para aplicar animaciones con condicionales
export const createAnimation = (
  animation: any,
  duration: string = animationTimings.normal,
  delay: string = '0s',
  fillMode: string = 'both'
) => ({
  animation: `${animation} ${duration} ${delay} ${fillMode}`,
  
  // Respetar preferencias de accesibilidad
  [responsiveAnimations.reduceMotion]: {
    animation: 'none',
    transform: 'none'
  }
});

// Animaciones en hover para tarjetas y botones
export const hoverAnimations = {
  card: {
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translateY(-8px)',
      boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
    },
    [responsiveAnimations.reduceMotion]: {
      '&:hover': {
        transform: 'none'
      }
    }
  },
  
  button: {
    transition: 'all 0.2s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
    },
    [responsiveAnimations.reduceMotion]: {
      '&:hover': {
        transform: 'none'
      }
    }
  },
  
  icon: {
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'scale(1.1) rotate(5deg)',
      color: 'inherit'
    },
    [responsiveAnimations.reduceMotion]: {
      '&:hover': {
        transform: 'none'
      }
    }
  }
};

// Configuración de animaciones escalonadas para listas
export const staggeredAnimation = (index: number, baseDelay: number = 0.1) => ({
  ...createAnimation(slideUpAnimation, animationTimings.normal, `${index * baseDelay}s`),
});

// Configuración de parallax suave
export const parallaxConfig = {
  hero: {
    transform: 'translateY(var(--scroll-y, 0) * 0.5px)'
  },
  background: {
    transform: 'translateY(var(--scroll-y, 0) * 0.3px)'
  },
  foreground: {
    transform: 'translateY(var(--scroll-y, 0) * -0.2px)'
  }
};
