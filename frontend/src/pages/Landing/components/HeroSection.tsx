import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Stack,
  Chip,
  Avatar,
  Rating
} from '@mui/material';
import {
  PlayArrow,
  Check,
  Speed,
  Security,
  Integration
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

/**
 * Sección Hero principal de la landing page
 * Contiene el mensaje principal, propuesta de valor y CTA primario
 * Diseñada para máxima conversión e impacto visual
 */
const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/auth/login');
  };

  const handleWatchDemo = () => {
    // Por ahora navega al demo, más adelante se puede añadir un modal con video
    navigate('/demo');
  };

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        py: { xs: 8, md: 12 },
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Elementos decorativos de fondo */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={4} alignItems="center">
          {/* Contenido principal */}
          <Grid item xs={12} md={6}>
            <Stack spacing={4}>
              {/* Badge de funcionalidades */}
              <Chip
                label="🚀 Escalable para +1000 clientes"
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 600,
                  alignSelf: 'flex-start',
                  backdropFilter: 'blur(10px)'
                }}
              />

              {/* Título principal */}
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  fontWeight: 700,
                  lineHeight: 1.2,
                  mb: 2
                }}
              >
                Genera PDFs Automáticamente
                <Typography
                  component="span"
                  sx={{
                    display: 'block',
                    fontSize: { xs: '2rem', md: '2.8rem' },
                    background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 800
                  }}
                >
                  desde HubSpot
                </Typography>
              </Typography>

              {/* Subtítulo/descripción */}
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: '1.1rem', md: '1.3rem' },
                  opacity: 0.9,
                  lineHeight: 1.6,
                  maxWidth: '90%'
                }}
              >
                Editor avanzado de documentos con variables dinámicas de HubSpot. 
                Convierte automáticamente a PDF y sube los archivos a tus contactos y deals.
              </Typography>

              {/* Lista de características destacadas */}
              <Stack spacing={1.5}>
                {[
                  'Editor tipo Word con variables de HubSpot',
                  'Conversión automática a PDF',
                  'Integración nativa con workflows',
                  'Subida automática de archivos'
                ].map((feature, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Check 
                      sx={{ 
                        color: '#4ade80',
                        fontSize: '1.2rem',
                        backgroundColor: 'rgba(74, 222, 128, 0.2)',
                        borderRadius: '50%',
                        p: 0.3
                      }} 
                    />
                    <Typography sx={{ fontSize: '0.95rem' }}>
                      {feature}
                    </Typography>
                  </Box>
                ))}
              </Stack>

              {/* Botones de acción */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleGetStarted}
                  sx={{
                    backgroundColor: '#ff6b6b',
                    '&:hover': { backgroundColor: '#ff5252' },
                    py: 1.5,
                    px: 4,
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    boxShadow: '0 8px 25px rgba(255, 107, 107, 0.3)'
                  }}
                >
                  Comenzar Gratis
                </Button>
                
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<PlayArrow />}
                  onClick={handleWatchDemo}
                  sx={{
                    borderColor: 'rgba(255,255,255,0.5)',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    },
                    py: 1.5,
                    px: 4,
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    textTransform: 'none'
                  }}
                >
                  Ver Demo
                </Button>
              </Stack>

              {/* Indicadores de confianza */}
              <Stack direction="row" spacing={3} alignItems="center" sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Rating value={5} readOnly size="small" />
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    5.0 estrellas
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Más de 500 empresas confían en nosotros
                </Typography>
              </Stack>
            </Stack>
          </Grid>

          {/* Imagen/Demo visual */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                position: 'relative',
                maxWidth: 500,
                mx: 'auto'
              }}
            >
              {/* Mockup de la aplicación */}
              <Box
                sx={{
                  backgroundColor: 'white',
                  borderRadius: 3,
                  p: 3,
                  boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
                  transform: 'perspective(1000px) rotateY(-15deg) rotateX(10deg)',
                  transformOrigin: 'center center'
                }}
              >
                {/* Barra superior del mockup */}
                <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ff6b6b' }} />
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ffd93d' }} />
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#6bcf7f' }} />
                </Box>

                {/* Contenido del mockup */}
                <Box sx={{ color: '#333' }}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                    Editor de Documentos
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Chip label="{{contact.firstname}}" size="small" color="primary" />
                    <Chip label="{{deal.amount}}" size="small" color="secondary" />
                  </Box>
                  
                  <Box sx={{ 
                    height: 120, 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Typography color="text.secondary">
                      Estimado {{contact.firstname}}, <br />
                      tu propuesta por {{deal.amount}}...
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Elementos flotantes decorativos */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '10%',
                  right: '-10%',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 2,
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Speed sx={{ color: '#4ade80' }} />
                <Typography variant="body2">
                  Generación instantánea
                </Typography>
              </Box>

              <Box
                sx={{
                  position: 'absolute',
                  bottom: '20%',
                  left: '-15%',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 2,
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Integration sx={{ color: '#ff6b6b' }} />
                <Typography variant="body2">
                  Integración HubSpot
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HeroSection;
