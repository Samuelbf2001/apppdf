import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
  Badge
} from '@mui/material';
import {
  Check,
  Star,
  Business,
  Speed,
  Security,
  Support,
  CloudUpload,
  Analytics
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

/**
 * Sección de precios escalables
 * Muestra planes diseñados para diferentes tamaños de empresa
 * Incluye toggle anual/mensual y features destacadas
 */
const PricingSection: React.FC = () => {
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(false);

  const handleGetStarted = (plan: string) => {
    // En una implementación real, se podría pasar el plan seleccionado
    navigate('/auth/login');
  };

  const pricingPlans = [
    {
      name: 'Starter',
      description: 'Perfect para equipos pequeños que empiezan',
      monthlyPrice: 29,
      annualPrice: 24,
      popular: false,
      features: [
        'Hasta 100 documentos/mes',
        'Editor básico de plantillas',
        'Variables HubSpot estándar',
        'Conversión a PDF',
        'Soporte por email',
        '5 plantillas incluidas',
        'Integración HubSpot básica'
      ],
      limitations: [
        'Máximo 2 usuarios',
        'Plantillas básicas únicamente',
        'Sin personalización de marca'
      ],
      icon: <Speed sx={{ fontSize: 32 }} />,
      color: '#6366f1',
      buttonText: 'Empezar gratis'
    },
    {
      name: 'Professional',
      description: 'Ideal para empresas en crecimiento',
      monthlyPrice: 79,
      annualPrice: 65,
      popular: true,
      features: [
        'Hasta 1,000 documentos/mes',
        'Editor avanzado con diseño personalizado',
        'Todas las variables HubSpot',
        'Conversión a PDF premium',
        'Workflow actions personalizadas',
        'Plantillas ilimitadas',
        'Personalización de marca completa',
        'Soporte prioritario',
        'Analíticas básicas',
        'Integraciones webhook'
      ],
      limitations: [
        'Máximo 10 usuarios'
      ],
      icon: <Business sx={{ fontSize: 32 }} />,
      color: '#10b981',
      buttonText: 'Prueba 14 días gratis'
    },
    {
      name: 'Enterprise',
      description: 'Para empresas grandes con necesidades avanzadas',
      monthlyPrice: 199,
      annualPrice: 165,
      popular: false,
      features: [
        'Documentos ilimitados',
        'Usuarios ilimitados',
        'Editor enterprise con API',
        'Plantillas personalizadas por nuestro equipo',
        'Integraciones personalizadas',
        'SLA 99.9% uptime',
        'Soporte dedicado 24/7',
        'Analíticas avanzadas y reportes',
        'Cumplimiento GDPR y SOC2',
        'Implementación dedicada',
        'Capacitación del equipo incluida',
        'Backup y recuperación avanzada'
      ],
      limitations: [],
      icon: <Security sx={{ fontSize: 32 }} />,
      color: '#8b5cf6',
      buttonText: 'Contactar ventas'
    }
  ];

  const enterprises = [
    {
      size: '+1000 empleados',
      price: 'Precio personalizado',
      description: 'Solución completamente personalizada',
      features: [
        'Implementación on-premise disponible',
        'Integración con sistemas legacy',
        'Desarrollo de funciones personalizadas',
        'Arquitectura multi-región',
        'Cumplimiento normativo específico',
        'Soporte técnico dedicado'
      ]
    }
  ];

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: '#f8fafc' }}>
      <Container maxWidth="lg">
        {/* Encabezado */}
        <Stack spacing={3} alignItems="center" sx={{ mb: 8 }}>
          <Chip 
            label="💰 Precios Transparentes"
            sx={{
              backgroundColor: '#ddd6fe',
              color: '#7c3aed',
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
            Planes que crecen 
            <Typography
              component="span"
              sx={{
                display: 'block',
                background: 'linear-gradient(45deg, #8b5cf6, #7c3aed)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 800
              }}
            >
              con tu negocio
            </Typography>
          </Typography>

          <Typography
            variant="h6"
            align="center"
            sx={{
              color: '#64748b',
              maxWidth: 600,
              fontSize: { xs: '1rem', md: '1.2rem' }
            }}
          >
            Sin costos ocultos. Sin límites artificiales. Solo paga por lo que necesitas.
          </Typography>

          {/* Toggle anual/mensual */}
          <FormControlLabel
            control={
              <Switch
                checked={isAnnual}
                onChange={(e) => setIsAnnual(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body1">
                  Facturación anual
                </Typography>
                <Chip
                  label="20% descuento"
                  size="small"
                  sx={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.7rem'
                  }}
                />
              </Box>
            }
            sx={{ mt: 2 }}
          />
        </Stack>

        {/* Grid de planes */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {pricingPlans.map((plan, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Badge
                badgeContent={plan.popular ? "Más Popular" : ""}
                color="secondary"
                sx={{
                  width: '100%',
                  '& .MuiBadge-badge': {
                    top: 16,
                    right: 16,
                    backgroundColor: '#ff6b6b',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    py: 0.5,
                    px: 1
                  }
                }}
              >
                <Card
                  sx={{
                    height: '100%',
                    border: plan.popular ? `2px solid ${plan.color}` : '1px solid #e2e8f0',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Stack spacing={3}>
                      {/* Header del plan */}
                      <Box sx={{ textAlign: 'center' }}>
                        <Box
                          sx={{
                            backgroundColor: `${plan.color}15`,
                            color: plan.color,
                            p: 2,
                            borderRadius: 2,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2
                          }}
                        >
                          {plan.icon}
                        </Box>
                        
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 700,
                            color: '#1e293b',
                            mb: 1
                          }}
                        >
                          {plan.name}
                        </Typography>
                        
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#64748b',
                            mb: 3
                          }}
                        >
                          {plan.description}
                        </Typography>

                        {/* Precio */}
                        <Box sx={{ mb: 3 }}>
                          <Typography
                            variant="h3"
                            sx={{
                              fontWeight: 700,
                              color: plan.color,
                              display: 'inline'
                            }}
                          >
                            €{isAnnual ? plan.annualPrice : plan.monthlyPrice}
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              color: '#64748b',
                              display: 'inline',
                              ml: 1
                            }}
                          >
                            /mes
                          </Typography>
                          
                          {isAnnual && (
                            <Typography
                              variant="body2"
                              sx={{
                                color: '#64748b',
                                textDecoration: 'line-through',
                                display: 'block',
                                mt: 0.5
                              }}
                            >
                              €{plan.monthlyPrice}/mes mensual
                            </Typography>
                          )}
                        </Box>

                        {/* Botón principal */}
                        <Button
                          variant={plan.popular ? "contained" : "outlined"}
                          fullWidth
                          size="large"
                          onClick={() => handleGetStarted(plan.name)}
                          sx={{
                            py: 1.5,
                            borderRadius: 2,
                            fontWeight: 600,
                            fontSize: '1rem',
                            textTransform: 'none',
                            ...(plan.popular && {
                              backgroundColor: plan.color,
                              '&:hover': {
                                backgroundColor: plan.color,
                                filter: 'brightness(0.9)'
                              }
                            }),
                            ...(!plan.popular && {
                              borderColor: plan.color,
                              color: plan.color,
                              '&:hover': {
                                backgroundColor: `${plan.color}10`,
                                borderColor: plan.color
                              }
                            })
                          }}
                        >
                          {plan.buttonText}
                        </Button>
                      </Box>

                      {/* Features incluidas */}
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            color: '#1e293b',
                            fontWeight: 600,
                            mb: 2
                          }}
                        >
                          ✅ Incluido:
                        </Typography>
                        <List dense sx={{ py: 0 }}>
                          {plan.features.map((feature, idx) => (
                            <ListItem key={idx} sx={{ py: 0.5, px: 0 }}>
                              <ListItemIcon sx={{ minWidth: 28 }}>
                                <Check sx={{ fontSize: 16, color: '#10b981' }} />
                              </ListItemIcon>
                              <ListItemText
                                primary={feature}
                                primaryTypographyProps={{
                                  fontSize: '0.85rem',
                                  color: '#374151'
                                }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>

                      {/* Limitaciones (si las hay) */}
                      {plan.limitations.length > 0 && (
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              color: '#64748b',
                              fontWeight: 600,
                              mb: 1,
                              fontSize: '0.8rem'
                            }}
                          >
                            ⚠️ Limitaciones:
                          </Typography>
                          {plan.limitations.map((limitation, idx) => (
                            <Typography
                              key={idx}
                              variant="body2"
                              sx={{
                                color: '#64748b',
                                fontSize: '0.8rem',
                                mb: 0.5
                              }}
                            >
                              • {limitation}
                            </Typography>
                          ))}
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Badge>
            </Grid>
          ))}
        </Grid>

        {/* Sección Enterprise personalizada */}
        <Box
          sx={{
            p: 6,
            backgroundColor: 'white',
            borderRadius: 3,
            border: '1px solid #e2e8f0',
            textAlign: 'center'
          }}
        >
          <Stack spacing={4} alignItems="center">
            <Box>
              <Analytics sx={{ fontSize: 48, color: '#8b5cf6', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 2 }}>
                ¿Necesitas una solución Enterprise?
              </Typography>
              <Typography variant="h6" sx={{ color: '#64748b', maxWidth: 600 }}>
                Para empresas con más de 1000 empleados ofrecemos soluciones completamente 
                personalizadas con implementación dedicada y soporte 24/7.
              </Typography>
            </Box>

            <Grid container spacing={3} justifyContent="center" sx={{ maxWidth: 800 }}>
              {enterprises[0].features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Star sx={{ fontSize: 16, color: '#8b5cf6' }} />
                    <Typography variant="body2" sx={{ color: '#374151' }}>
                      {feature}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Button
              variant="contained"
              size="large"
              startIcon={<Support />}
              onClick={() => handleGetStarted('Enterprise')}
              sx={{
                backgroundColor: '#8b5cf6',
                '&:hover': { backgroundColor: '#7c3aed' },
                py: 1.5,
                px: 4,
                borderRadius: 2,
                fontWeight: 600,
                fontSize: '1.1rem',
                textTransform: 'none'
              }}
            >
              Contactar Equipo Enterprise
            </Button>
          </Stack>
        </Box>

        {/* FAQ rápido sobre precios */}
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 3 }}>
            💡 Preguntas frecuentes sobre precios
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}>
                ¿Puedo cambiar de plan?
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Sí, puedes cambiar entre planes en cualquier momento. Los cambios se aplican inmediatamente.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}>
                ¿Hay contratos a largo plazo?
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                No, todos nuestros planes son mes a mes. Puedes cancelar en cualquier momento sin penalizaciones.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}>
                ¿Qué métodos de pago aceptan?
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Aceptamos todas las tarjetas principales, transferencia bancaria y PayPal.
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default PricingSection;
