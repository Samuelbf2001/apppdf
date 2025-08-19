import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importar componentes de la landing page
import Navigation from './components/Landing/Navigation';
import HeroSection from './components/Landing/HeroSection';
import BenefitsSection from './components/Landing/BenefitsSection';
import FeaturesSection from './components/Landing/FeaturesSection';
import TestimonialsSection from './components/Landing/TestimonialsSection';
import PricingSection from './components/Landing/PricingSection';
import CTASection from './components/Landing/CTASection';
import Footer from './components/Landing/Footer';

// Crear tema personalizado para la aplicación
const theme = createTheme({
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  palette: {
    primary: {
      main: '#2563eb',
    },
    secondary: {
      main: '#8b5cf6',
    },
    background: {
      default: '#ffffff',
    },
  },
});

/**
 * Componente principal de la aplicación
 * Configuración del tema, rutas y estructura de la landing page
 */
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <Navigation />
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <HeroSection />
                  <BenefitsSection />
                  <FeaturesSection />
                  <TestimonialsSection />
                  <PricingSection />
                  <CTASection />
                </>
              }
            />
          </Routes>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
