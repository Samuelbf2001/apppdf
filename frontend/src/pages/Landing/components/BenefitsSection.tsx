import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Avatar
} from '@mui/material';
import {
  Check,
  TrendingUp,
  AccessTime,
  MoneyOff,
  Groups,
  AutoAwesome,
  Business,
  Support
} from '@mui/icons-material';

/**
 * Sección de beneficios y casos de uso
 * Explica el valor que aporta la solución y cómo resuelve problemas reales
 * Incluye casos de uso específicos para diferentes tipos de empresas
 */
const BenefitsSection: React.FC = () => {
  // Beneficios principales con datos cuantificables
  const mainBenefits = [
    {
      icon: <AccessTime sx={{ fontSize: 32 }} />,
      title: 'Ahorra 15+ horas semanales',
      description: 'Elimina la creación manual de documentos. Lo que antes tomaba horas, ahora se hace en segundos automáticamente.',
      stats: '95% menos tiempo',
      color: '#10b981'
    },
    {
      icon: <MoneyOff sx={{ fontSize: 32 }} />,
      title: 'Reduce costos operativos',
      description: 'Sin necesidad de contratar personal adicional para documentos. Una solución automatizada que se paga sola.',
      stats: '60% menos costos',
      color: '#f59e0b'
    },
    {
      icon: <TrendingUp sx={{ fontSize: 32 }} />,
      title: 'Aumenta tasa de conversión',
      description: 'Documentos profesionales entregados al instante. Tus clientes reciben propuestas mientras el interés está al máximo.',
      stats: '+40% conversión',
      color: '#6366f1'
    },
    {
      icon: <AutoAwesome sx={{ fontSize: 32 }} />,
      title: 'Elimina errores humanos',
      description: 'Variables automáticas desde HubSpot garantizan información siempre actualizada y correcta en todos los documentos.',
      stats: '99.9% precisión',
      color: '#ec4899'
    }
  ];

  // Casos de uso por industria
  const useCases = [
    {
      industry: 'Agencias de Marketing',
      avatar: '🎯',
      challenges: [
        'Propuestas personalizadas para cada cliente',
        'Reportes mensuales automáticos',
        'Contratos de servicios escalables'
      ],
      results: '3x más propuestas enviadas por día'
    },
    {
      industry: 'Empresas SaaS',
      avatar: '💻',
      challenges: [
        'Documentación de onboarding',
        'Facturas personalizadas automáticas',
        'Acuerdos de nivel de servicio (SLA)'
      ],
      results: '50% reducción en tiempo de onboarding'
    },
    {
      industry: 'Consultorías',
      avatar: '📊',
      challenges: [
        'Diagnósticos empresariales',
        'Propuestas de consultoría complejas',
        'Informes de progreso para clientes'
      ],
      results: '80% más clientes atendidos simultáneamente'
    },
    {
      industry: 'Inmobiliarias',
      avatar: '🏠',
      challenges: [
        'Contratos de compraventa',
        'Documentos de evaluación de propiedades',
        'Propuestas de inversión'
      ],
      results: '2x más transacciones completadas'
    }
  ];

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: '#f8fafc' }}>
      <Container maxWidth="lg">
        {/* Encabezado principal */}
        <Stack spacing={3} alignItems="center" sx={{ mb: 10 }}>
          <Chip 
            label="💼 Beneficios Comprobados"
            sx={{
              backgroundColor: '#ecfdf5',
              color: '#059669',
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
              maxWidth: 700
            }}
          >
            Transforma tu operación con 
            <Typography
              component="span"
              sx={{
                display: 'block',
                background: 'linear-gradient(45deg, #10b981, #059669)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 800
              }}
            >
              resultados medibles
            </Typography>
          </Typography>
        </Stack>

        {/* Beneficios principales */}
        <Grid container spacing={4} sx={{ mb: 12 }}>
          {mainBenefits.map((benefit, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Box
                sx={{
                  p: 4,
                  backgroundColor: 'white',
                  borderRadius: 3,
                  height: '100%',
                  border: '1px solid',
                  borderColor: '#e2e8f0',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                    borderColor: benefit.color
                  }
                }}
              >
                <Stack spacing={3}>
                  {/* Icono y estadística */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box
                      sx={{
                        backgroundColor: `${benefit.color}15`,
                        color: benefit.color,
                        p: 2,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {benefit.icon}
                    </Box>
                    
                    <Chip
                      label={benefit.stats}
                      sx={{
                        backgroundColor: benefit.color,
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.8rem'
                      }}
                    />
                  </Box>

                  {/* Título y descripción */}
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: '1.3rem',
                        fontWeight: 600,
                        color: '#1e293b',
                        mb: 2
                      }}
                    >
                      {benefit.title}
                    </Typography>
                    
                    <Typography
                      variant="body1"
                      sx={{
                        color: '#64748b',
                        lineHeight: 1.6
                      }}
                    >
                      {benefit.description}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Separador visual */}
        <Box sx={{ textAlign: 'center', mb: 10 }}>
          <Typography
            variant="h4"
            sx={{
              fontSize: { xs: '1.5rem', md: '2rem' },
              fontWeight: 600,
              color: '#1e293b',
              mb: 2
            }}
          >
            Casos de uso por industria
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#64748b',
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            Descubre cómo empresas de diferentes sectores están transformando 
            sus procesos de documentación
          </Typography>
        </Box>

        {/* Casos de uso por industria */}
        <Grid container spacing={4}>
          {useCases.map((useCase, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Box
                sx={{
                  p: 4,
                  backgroundColor: 'white',
                  borderRadius: 3,
                  height: '100%',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <Stack spacing={3}>
                  {/* Header con avatar e industria */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{
                        width: 50,
                        height: 50,
                        fontSize: '1.5rem',
                        backgroundColor: '#f1f5f9'
                      }}
                    >
                      {useCase.avatar}
                    </Avatar>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: '#1e293b'
                      }}
                    >
                      {useCase.industry}
                    </Typography>
                  </Box>

                  {/* Desafíos/necesidades */}
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: '#64748b',
                        mb: 1,
                        textTransform: 'uppercase',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}
                    >
                      Necesidades comunes:
                    </Typography>
                    <List dense sx={{ py: 0 }}>
                      {useCase.challenges.map((challenge, idx) => (
                        <ListItem key={idx} sx={{ py: 0.5, px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <Check sx={{ fontSize: 16, color: '#10b981' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={challenge}
                            primaryTypographyProps={{
                              fontSize: '0.9rem',
                              color: '#64748b'
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>

                  {/* Resultado */}
                  <Box
                    sx={{
                      p: 3,
                      backgroundColor: '#ecfdf5',
                      borderRadius: 2,
                      borderLeft: '4px solid #10b981'
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#065f46',
                        fontWeight: 600,
                        fontSize: '0.9rem'
                      }}
                    >
                      💡 Resultado: {useCase.results}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* CTA section */}
        <Box
          sx={{
            mt: 10,
            p: 6,
            backgroundColor: 'white',
            borderRadius: 3,
            textAlign: 'center',
            border: '1px solid #e2e8f0'
          }}
        >
          <Stack spacing={3} alignItems="center">
            <Groups sx={{ fontSize: 48, color: '#6366f1' }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#1e293b' }}>
              ¿Tu industria no está listada?
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b', maxWidth: 500 }}>
              Nuestra solución es flexible y se adapta a cualquier tipo de negocio que 
              genere documentos. Contáctanos para una demo personalizada.
            </Typography>
            <Chip
              icon={<Support />}
              label="Hablar con un especialista"
              clickable
              sx={{
                backgroundColor: '#6366f1',
                color: 'white',
                fontWeight: 600,
                py: 2,
                px: 3,
                '&:hover': {
                  backgroundColor: '#4f46e5'
                }
              }}
            />
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default BenefitsSection;
