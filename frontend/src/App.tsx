import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';

import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout/Layout';
import LoadingScreen from './components/Common/LoadingScreen';

// Páginas
import LandingPage from './pages/Landing/LandingPage';
import LoginPage from './pages/Auth/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import TemplatesPage from './pages/Templates/TemplatesPage';
import TemplateEditorPage from './pages/Templates/TemplateEditorPage';
import TemplateBuilderPage from './pages/Templates/TemplateBuilderPage';
import DemoPage from './pages/Demo/DemoPage';
import DocumentsPage from './pages/Documents/DocumentsPage';
import DocumentViewerPage from './pages/Documents/DocumentViewerPage';
import HubSpotIntegrationPage from './pages/HubSpot/HubSpotIntegrationPage';
import QueueMonitorPage from './pages/Queue/QueueMonitorPage';
import SettingsPage from './pages/Settings/SettingsPage';
import NotFoundPage from './pages/Error/NotFoundPage';

/**
 * Componente principal de la aplicación
 * Maneja enrutamiento y autenticación
 */
function App() {
  const { user, isLoading, isAuthenticated } = useAuth();

  // Mostrar loading mientras se verifica autenticación
  if (isLoading) {
    return <LoadingScreen message="Verificando autenticación..." />;
  }

  // Si no está autenticado, mostrar landing page y rutas de autenticación
  if (!isAuthenticated) {
    return (
      <Box sx={{ minHeight: '100vh' }}>
        <Routes>
          {/* Landing page como página principal */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/landing" element={<LandingPage />} />
          
          {/* Rutas de autenticación */}
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/success" element={<LoginPage />} />
          <Route path="/auth/error" element={<LoginPage />} />
          
          {/* Demo público accesible sin autenticación */}
          <Route path="/demo" element={<DemoPage />} />
          
          {/* Redirigir otras rutas a landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    );
  }

  // Usuario autenticado - mostrar aplicación completa
  return (
    <Layout user={user}>
      <Routes>
        {/* Dashboard */}
        <Route path="/" element={<DashboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Templates */}
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/templates/new" element={<TemplateEditorPage />} />
        <Route path="/templates/:id/edit" element={<TemplateEditorPage />} />
        <Route path="/templates/builder" element={<TemplateBuilderPage />} />
        <Route path="/demo" element={<DemoPage />} />

        {/* Documentos */}
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/documents/:id" element={<DocumentViewerPage />} />

        {/* Integración HubSpot */}
        <Route path="/hubspot" element={<HubSpotIntegrationPage />} />

        {/* Monitoreo de colas */}
        <Route path="/queue" element={<QueueMonitorPage />} />

        {/* Configuraciones */}
        <Route path="/settings" element={<SettingsPage />} />

        {/* Error 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
