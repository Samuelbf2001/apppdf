import React from 'react';
import { Box, Container, Typography, Button, Stack } from '@mui/material';
import { Rocket } from '@mui/icons-material';

const CTASection: React.FC = () => {
  const handleGetStarted = () => {
    window.location.href = 'http://localhost:3001/auth/login';
  };

  return (
    <Box sx={{ 
      py: 10, 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      <Container maxWidth="md">
        <Stack spacing={4} alignItems="center" textAlign="center">
          <Typography variant="h2" sx={{ fontWeight: 700 }}>
            ¿Listo para automatizar tus documentos?
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 600 }}>
            Únete a más de 500 empresas que ya están ahorrando horas de trabajo manual. 
            Comienza tu prueba gratuita de 14 días ahora.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<Rocket />}
            onClick={handleGetStarted}
            sx={{
              backgroundColor: '#ff6b6b',
              '&:hover': { backgroundColor: '#ff5252' },
              py: 2,
              px: 5,
              fontSize: '1.2rem',
              fontWeight: 600
            }}
          >
            Empezar Prueba Gratis
          </Button>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            ✅ Sin tarjeta de crédito • ✅ Configuración en 5 minutos • ✅ Soporte incluido
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};

export default CTASection;
