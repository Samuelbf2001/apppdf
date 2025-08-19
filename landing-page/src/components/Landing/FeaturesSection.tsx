import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip
} from '@mui/material';
import {
  EditNote,
  PictureAsPdf,
  Autorenew,
  CloudUpload,
  Security,
  Speed
} from '@mui/icons-material';

/**
 * Sección de características principales
 * Muestra las funcionalidades clave de la aplicación de forma visual
 * Diseñada para educar al usuario sobre las capacidades del producto
 */
const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: <EditNote sx={{ fontSize: 40 }} />,
      title: 'Editor Avanzado de Documentos',
      description: 'Editor WYSIWYG intuitivo tipo Word con inserción de variables de HubSpot en tiempo real. Diseña documentos profesionales sin conocimientos técnicos.',
      highlight: 'Sin código',
      color: '#6366f1'
    },
    {
      icon: <PictureAsPdf sx={{ fontSize: 40 }} />,
      title: 'Conversión Automática PDF',
      description: 'Tecnología Gotenberg para conversión perfecta de documentos. Mantiene formato, fuentes y diseño exactamente como lo diseñaste.',
      highlight: 'Alta calidad',
      color: '#ec4899'
    },
    {
      icon: <Autorenew sx={{ fontSize: 40 }} />,
      title: 'Workflow Actions Nativas',
      description: 'Integración completa con workflows de HubSpot. Genera documentos automáticamente cuando se cumplan las condiciones que definas.',
      highlight: 'Automático',
      color: '#10b981'
    },
    {
      icon: <CloudUpload sx={{ fontSize: 40 }} />,
      title: 'Subida Automática a HubSpot',
      description: 'Los PDFs generados se adjuntan automáticamente a contactos, empresas o deals. Sin pasos manuales, todo funciona en segundo plano.',
      highlight: 'Sin fricción',
      color: '#f59e0b'
    },

    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: 'Seguridad Multi-tenant',
      description: 'Aislamiento completo de datos por cliente. Autenticación OAuth2, tokens JWT y cumplimiento de estándares de seguridad.',
      highlight: 'Seguro',
      color: '#ef4444'
    },
    {
      icon: <Speed sx={{ fontSize: 40 }} />,
      title: 'Procesamiento Rápido',
      description: 'Generación de PDFs en menos de 3 segundos. Sistema de colas Redis para procesamiento asíncrono y notificaciones en tiempo real.',
      highlight: 'Ultrarrápido',
      color: '#06b6d4'
    }
  ];

  return (
    <Box id="features" sx={{ py: { xs: 8, md: 12 }, backgroundColor: '#f8fafc' }}>
      <Container maxWidth="lg">
        {/* Encabezado de la sección */}
        <Stack spacing={3} alignItems="center" sx={{ mb: 8 }}>
          <Chip 
            label="🎯 Características Principales"
            sx={{
              backgroundColor: '#f0f9ff',
              color: '#0ea5e9',
              fontWeight: 600,
              fontSize: '0.9rem'
            }}
          />
          
          <Typography
            variant="h2"
            align="center"
            sx={{
              fontSize: { xs: '2rem', md: '2.8rem' },
              fontWeight: 700,
              color: '#1e293b',
              maxWidth: 600
            }}
          >
            Todo lo que necesitas para 
            <Typography
              component="span"
              sx={{
                display: 'block',
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 800
              }}
            >
              automatizar tus documentos
            </Typography>
          </Typography>

          <Typography
            variant="h6"
            align="center"
            sx={{
              color: '#64748b',
              maxWidth: 700,
              fontSize: { xs: '1rem', md: '1.2rem' },
              lineHeight: 1.6
            }}
          >
            Desde la creación hasta la entrega, nuestra plataforma maneja todo el proceso 
            de generación de documentos de forma inteligente y escalable.
          </Typography>
        </Stack>

        {/* Grid de características */}
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={index}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: 'transparent',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    borderColor: feature.color,
                    '& .feature-icon': {
                      transform: 'scale(1.1)',
                      color: feature.color
                    }
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Stack spacing={3}>
                    {/* Icono y highlight */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <Box
                        className="feature-icon"
                        sx={{
                          color: '#64748b',
                          transition: 'all 0.3s ease',
                          backgroundColor: `${feature.color}10`,
                          p: 2,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {feature.icon}
                      </Box>
                      
                      <Chip
                        label={feature.highlight}
                        size="small"
                        sx={{
                          backgroundColor: `${feature.color}15`,
                          color: feature.color,
                          fontWeight: 600,
                          fontSize: '0.75rem'
                        }}
                      />
                    </Box>

                    {/* Título */}
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        color: '#1e293b',
                        lineHeight: 1.3
                      }}
                    >
                      {feature.title}
                    </Typography>

                    {/* Descripción */}
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#64748b',
                        lineHeight: 1.6,
                        fontSize: '0.95rem'
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Sección de stats o métricas */}
        <Box
          sx={{
            mt: 12,
            p: 6,
            backgroundColor: '#f8fafc',
            borderRadius: 3,
            textAlign: 'center'
          }}
        >
          <Grid container spacing={4}>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
                99.9%
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Tiempo de actividad
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
                &lt;3s
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Tiempo de generación
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
                500+
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Empresas activas
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
                1M+
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                PDFs generados
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default FeaturesSection;
