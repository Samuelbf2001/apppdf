import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Grid,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Rocket,
  Check,
  AccessTime,
  CreditCard,
  Support,
  Security
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

/**
 * Sección final de Call-to-Action
 * Última oportunidad de conversión con oferta irresistible
 * Incluye garantías, prueba gratuita y beneficios inmediatos
 */
const CTASection: React.FC = () => {
  const navigate = useNavigate();

  const handleStartFree = () => {
    navigate('/auth/login');
  };

  const handleWatchDemo = () => {
    navigate('/demo');
  };

  const guarantees = [
    {
      icon: <AccessTime sx={{ fontSize: 20 }} />,
      title: '14 días gratis',
      description: 'Prueba completa sin limitaciones'
    },
    {
      icon: <CreditCard sx={{ fontSize: 20 }} />,
      title: 'Sin tarjeta requerida',
      description: 'Empieza inmediatamente'
    },
    {
      icon: <Support sx={{ fontSize: 20 }} />,
      title: 'Soporte incluido',
      description: 'Te ayudamos a configurar todo'
    },
    {
      icon: <Security sx={{ fontSize: 20 }} />,
      title: 'Cancela cuando quieras',
      description: 'Sin compromisos a largo plazo'
    }
  ];

  const immediateValue = [
    'Configura tu primera plantilla en 5 minutos',
    'Genera tu primer PDF automáticamente',
    'Integra con HubSpot sin código',
    'Acceso a biblioteca de plantillas',
    'Soporte personal durante la configuración'
  ];

  return (
    <Box
      id="contact"
      sx={{
        py: { xs: 10, md: 14 },
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
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
          background: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={6} alignItems="center">
          {/* Contenido principal */}
          <Grid size={{ xs: 12, lg: 7 }}>
            <Stack spacing={4}>
              {/* Badge de urgencia */}
              <Chip
                label="🎯 Oferta de Lanzamiento - Solo por tiempo limitado"
                sx={{
                  backgroundColor: '#ff6b6b',
                  color: 'white',
                  fontWeight: 600,
                  alignSelf: 'flex-start',
                  fontSize: '0.9rem',
                  py: 1,
                  px: 2,
                  animation: 'pulse 2s infinite'
                }}
              />

              {/* Título principal */}
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.2rem' },
                  fontWeight: 800,
                  lineHeight: 1.1,
                  mb: 2
                }}
              >
                ¿Listo para automatizar
                <Typography
                  component="span"
                  sx={{
                    display: 'block',
                    background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: { xs: '2.2rem', md: '2.8rem' }
                  }}
                >
                  tus documentos hoy?
                </Typography>
              </Typography>

              {/* Subtítulo con urgencia */}
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: '1.1rem', md: '1.3rem' },
                  opacity: 0.95,
                  lineHeight: 1.5,
                  maxWidth: '85%'
                }}
              >
                Únete a más de 500 empresas que ya están ahorrando horas de trabajo manual. 
                <strong> Comienza tu prueba gratuita de 14 días ahora</strong> y ve los resultados inmediatamente.
              </Typography>

              {/* Valor inmediato */}
              <Box sx={{ my: 3 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    fontSize: '1.1rem'
                  }}
                >
                  🚀 Lo que conseguirás en los primeros 30 minutos:
                </Typography>
                <List dense sx={{ pl: 0 }}>
                  {immediateValue.map((item, index) => (
                    <ListItem key={index} sx={{ py: 0.3, px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Check 
                          sx={{ 
                            color: '#4ade80',
                            fontSize: '1.1rem',
                            backgroundColor: 'rgba(74, 222, 128, 0.2)',
                            borderRadius: '50%',
                            p: 0.2
                          }} 
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={item}
                        primaryTypographyProps={{
                          fontSize: '0.95rem',
                          fontWeight: 500
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>

              {/* Botones de acción principales */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mt: 4 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Rocket />}
                  onClick={handleStartFree}
                  sx={{
                    backgroundColor: '#ff6b6b',
                    '&:hover': { backgroundColor: '#ff5252' },
                    py: 2,
                    px: 5,
                    borderRadius: 3,
                    fontWeight: 700,
                    fontSize: '1.2rem',
                    textTransform: 'none',
                    boxShadow: '0 12px 30px rgba(255, 107, 107, 0.4)',
                    minWidth: 250
                  }}
                >
                  Empezar Prueba Gratis
                </Button>
                
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleWatchDemo}
                  sx={{
                    borderColor: 'rgba(255,255,255,0.7)',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    },
                    py: 2,
                    px: 4,
                    borderRadius: 3,
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    minWidth: 200
                  }}
                >
                  Ver Demo en Vivo
                </Button>
              </Stack>

              {/* Texto de tranquilidad */}
              <Typography
                variant="body2"
                sx={{
                  opacity: 0.8,
                  fontSize: '0.9rem',
                  mt: 2
                }}
              >
                ✅ Sin tarjeta de crédito requerida • ✅ Configuración en 5 minutos • ✅ Soporte incluido
              </Typography>
            </Stack>
          </Grid>

          {/* Panel de garantías */}
          <Grid size={{ xs: 12, lg: 5 }}>
            <Box
              sx={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(20px)',
                borderRadius: 4,
                p: 4,
                border: '1px solid rgba(255,255,255,0.2)'
              }}
            >
              <Stack spacing={3}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    textAlign: 'center',
                    mb: 2
                  }}
                >
                  🛡️ Garantía de Satisfacción
                </Typography>

                {guarantees.map((guarantee, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      borderRadius: 2,
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white'
                      }}
                    >
                      {guarantee.icon}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.95rem'
                        }}
                      >
                        {guarantee.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          opacity: 0.9,
                          fontSize: '0.85rem'
                        }}
                      >
                        {guarantee.description}
                      </Typography>
                    </Box>
                  </Box>
                ))}

                {/* Testimonial destacado */}
                <Box
                  sx={{
                    mt: 3,
                    p: 3,
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    borderRadius: 3,
                    borderLeft: '4px solid #4ade80'
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontStyle: 'italic',
                      mb: 2,
                      fontSize: '0.9rem'
                    }}
                  >
                    "La configuración fue increíblemente fácil. En 10 minutos ya tenía mi primera 
                    plantilla funcionando y generando PDFs automáticamente."
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.8rem' }}>
                      MG
                    </Avatar>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      María González, TechStartup Madrid
                    </Typography>
                  </Box>
                </Box>

                {/* Contador de tiempo (decorativo) */}
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                    💎 Oferta especial válida solo durante:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFD700' }}>
                    Los próximos 7 días
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Estilos para animaciones */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.8;
            }
          }
        `}
      </style>
    </Box>
  );
};

export default CTASection;
