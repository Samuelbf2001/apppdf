import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Stack,
  useTheme,
} from '@mui/material';
import { HubSpot as HubSpotIcon } from '@mui/icons-material';

import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import LoadingScreen from '../../components/Common/LoadingScreen';

/**
 * Página de autenticación con HubSpot OAuth2
 */
const LoginPage: React.FC = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { login, isLoading, isAuthenticated } = useAuth();

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Manejar parámetros de URL (success/error callbacks)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const errorParam = params.get('error');
    const message = params.get('message');

    if (token) {
      // Éxito en OAuth - procesar token
      setSuccess('Autenticación exitosa. Iniciando sesión...');
      login(token);
    } else if (errorParam) {
      // Error en OAuth
      setError(decodeURIComponent(message || errorParam));
    }

    // Limpiar URL
    if (params.has('token') || params.has('error')) {
      window.history.replaceState({}, document.title, '/auth/login');
    }
  }, [location.search, login]);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleHubSpotLogin = async () => {
    setIsAuthenticating(true);
    setError(null);
    
    try {
      // Obtener URL de autorización y redirigir
      authService.redirectToHubSpotAuth();
    } catch (error: any) {
      console.error('Error iniciando autenticación:', error);
      setError('Error iniciando proceso de autenticación. Inténtalo de nuevo.');
      setIsAuthenticating(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Verificando autenticación..." />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.secondary.main}08 100%)`,
      }}
    >
      <Container maxWidth="sm">
        <Stack spacing={4} alignItems="center">
          {/* Logo/Título */}
          <Box textAlign="center">
            <Typography
              variant="h3"
              component="h1"
              color="primary"
              fontWeight={700}
              gutterBottom
            >
              HubSpot PDF Generator
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              Generador automático de documentos PDF
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Integración completa con HubSpot para crear documentos profesionales
            </Typography>
          </Box>

          {/* Card de login */}
          <Card
            sx={{
              width: '100%',
              maxWidth: 440,
              boxShadow: theme.shadows[8],
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={3}>
                <Box textAlign="center">
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    Iniciar Sesión
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Conecta con tu cuenta de HubSpot para comenzar
                  </Typography>
                </Box>

                {/* Mensajes de estado */}
                {error && (
                  <Alert severity="error" sx={{ borderRadius: 2 }}>
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert severity="success" sx={{ borderRadius: 2 }}>
                    {success}
                  </Alert>
                )}

                {/* Botón de login con HubSpot */}
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleHubSpotLogin}
                  disabled={isAuthenticating}
                  startIcon={<HubSpotIcon />}
                  sx={{
                    py: 1.5,
                    fontSize: '1.1rem',
                    backgroundColor: '#ff6b35',
                    '&:hover': {
                      backgroundColor: '#e55a2b',
                    },
                  }}
                >
                  {isAuthenticating ? 'Conectando...' : 'Conectar con HubSpot'}
                </Button>

                {/* Información adicional */}
                <Box textAlign="center" pt={2}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Al conectar, autorizas el acceso a tu cuenta de HubSpot
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Permisos: Lectura de contactos, deals, companies y archivos
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Features destacados */}
          <Box
            sx={{
              width: '100%',
              maxWidth: 600,
              textAlign: 'center',
              mt: 4,
            }}
          >
            <Typography variant="h6" color="text.primary" gutterBottom>
              ¿Por qué usar HubSpot PDF Generator?
            </Typography>
            
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={3}
              sx={{ mt: 3 }}
            >
              <Box flex={1}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  🎨 Templates Dinámicos
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Crea documentos con variables automáticas de HubSpot
                </Typography>
              </Box>

              <Box flex={1}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  🚀 Generación Automática
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  PDFs de alta calidad generados al instante
                </Typography>
              </Box>

              <Box flex={1}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  📎 Integración Total
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Archivos adjuntados automáticamente en HubSpot
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default LoginPage;
