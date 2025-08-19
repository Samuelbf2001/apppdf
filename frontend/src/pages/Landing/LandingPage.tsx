import React from 'react';
import { Box } from '@mui/material';

// Componentes de la landing page
import Navigation from './components/Navigation';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import BenefitsSection from './components/BenefitsSection';
import PricingSection from './components/PricingSection';
import TestimonialsSection from './components/TestimonialsSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';

/**
 * Página principal de landing
 * Diseñada para conversión y presentación de la aplicación
 * Incluye todas las secciones necesarias para convencer al usuario
 */
const LandingPage: React.FC = () => {
  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        overflowX: 'hidden'
      }}
    >
      {/* Navegación fija */}
      <Navigation />
      
      {/* Sección Hero - Primera impresión crucial */}
      <Box id="hero">
        <HeroSection />
      </Box>
      
      {/* Características principales - Qué hace la aplicación */}
      <Box id="features">
        <FeaturesSection />
      </Box>
      
      {/* Beneficios y casos de uso - Por qué elegir nosotros */}
      <Box id="benefits">
        <BenefitsSection />
      </Box>
      
      {/* Testimonios - Prueba social */}
      <Box id="testimonials">
        <TestimonialsSection />
      </Box>
      
      {/* Precios - Planes escalables */}
      <Box id="pricing">
        <PricingSection />
      </Box>
      
      {/* Call to Action final - Conversión */}
      <CTASection />
      
      {/* Footer con información adicional */}
      <Footer />
    </Box>
  );
};

export default LandingPage;
