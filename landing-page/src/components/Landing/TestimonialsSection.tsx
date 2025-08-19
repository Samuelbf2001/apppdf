import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Stack,
  Chip,
  Rating
} from '@mui/material';
import {
  FormatQuote,
  Business,
  TrendingUp,
  Speed,
  CheckCircle,
  Autorenew
} from '@mui/icons-material';

/**
 * Sección de testimonios y prueba social
 * Muestra casos de éxito reales para generar confianza
 * Incluye métricas específicas y empresas reconocibles
 */
const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      name: 'María González',
      position: 'Directora de Operaciones',
      company: 'TechStartup Madrid',
      avatar: '/avatars/maria.jpg', // Placeholder - en producción usar imágenes reales
      rating: 5,
      quote: 'Antes tardábamos horas creando informes manuales. Ahora nuestros workflows automáticos generan documentos al instante cuando se actualiza un deal. El equipo puede enfocarse en tareas más estratégicas.',
      metrics: {
        icon: <Speed sx={{ fontSize: 20 }} />,
        value: '20h',
        description: 'ahorradas por semana'
      },
      industry: 'SaaS',
      companySize: '50-100 empleados'
    },
    {
      name: 'Carlos Ruiz',
      position: 'Operations Manager',
      company: 'Inmobiliaria Barcelona Plus',
      avatar: '/avatars/carlos.jpg',
      rating: 5,
      quote: 'La automatización de contratos elimina errores manuales y garantiza que siempre tengamos la documentación al día. Nuestros procesos son mucho más eficientes y confiables.',
      metrics: {
        icon: <CheckCircle sx={{ fontSize: 20 }} />,
        value: '99%',
        description: 'precisión en documentos'
      },
      industry: 'Inmobiliaria',
      companySize: '20-50 empleados'
    },
    {
      name: 'Ana Martínez',
      position: 'Head of Operations',
      company: 'Agencia Digital Valencia',
      avatar: '/avatars/ana.jpg',
      rating: 5,
      quote: 'Los reportes se generan automáticamente y se envían a nuestros clientes sin intervención manual. Hemos eliminado completamente las tareas repetitivas de documentación.',
      metrics: {
        icon: <Autorenew sx={{ fontSize: 20 }} />,
        value: '100%',
        description: 'automatización lograda'
      },
      industry: 'Marketing',
      companySize: '10-30 empleados'
    },
    {
      name: 'Roberto Silva',
      position: 'Coordinador de Procesos',
      company: 'Consultoría Estratégica',
      avatar: '/avatars/roberto.jpg',
      rating: 5,
      quote: 'Ya no tenemos que preocuparnos por formatos inconsistentes o información desactualizada. Todos nuestros documentos mantienen el mismo estándar profesional automáticamente.',
      metrics: {
        icon: <Business sx={{ fontSize: 20 }} />,
        value: '100%',
        description: 'consistencia en documentos'
      },
      industry: 'Consultoría',
      companySize: '5-20 empleados'
    }
  ];

  const companies = [
    { name: 'TechCorp', logo: '🏢', industry: 'Tecnología' },
    { name: 'InnovaMarketing', logo: '🎯', industry: 'Marketing' },
    { name: 'ConstructoPro', logo: '🏗️', industry: 'Construcción' },
    { name: 'MediConsult', logo: '🏥', industry: 'Salud' },
    { name: 'FinanceMax', logo: '💰', industry: 'Finanzas' },
    { name: 'EduTech Solutions', logo: '🎓', industry: 'Educación' }
  ];

  return (
    <Box id="testimonials" sx={{ py: { xs: 8, md: 12 }, backgroundColor: 'white' }}>
      <Container maxWidth="lg">
        {/* Encabezado */}
        <Stack spacing={3} alignItems="center" sx={{ mb: 10 }}>
          <Chip 
            label="⭐ Testimonios Reales"
            sx={{
              backgroundColor: '#fef3c7',
              color: '#d97706',
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
            Más de 500 empresas confían 
            <Typography
              component="span"
              sx={{
                display: 'block',
                background: 'linear-gradient(45deg, #f59e0b, #d97706)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 800
              }}
            >
              en nuestra solución
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
            Descubre cómo otras empresas han transformado sus procesos 
            de documentación y conseguido resultados medibles
          </Typography>
        </Stack>

        {/* Grid de testimonios */}
        <Grid container spacing={4} sx={{ mb: 10 }}>
          {testimonials.map((testimonial, index) => (
            <Grid size={{ xs: 12, md: 6 }} key={index}>
              <Card
                sx={{
                  height: '100%',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Stack spacing={3}>
                    {/* Icono de quote */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <FormatQuote 
                        sx={{ 
                          fontSize: 40, 
                          color: '#f59e0b',
                          transform: 'rotate(180deg)'
                        }} 
                      />
                      <Rating value={testimonial.rating} readOnly size="small" />
                    </Box>

                    {/* Quote/testimonio */}
                    <Typography
                      variant="body1"
                      sx={{
                        color: '#374151',
                        fontStyle: 'italic',
                        lineHeight: 1.6,
                        fontSize: '1rem'
                      }}
                    >
                      "{testimonial.quote}"
                    </Typography>

                    {/* Métrica destacada */}
                    <Box
                      sx={{
                        p: 3,
                        backgroundColor: '#f0f9ff',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                      }}
                    >
                      <Box
                        sx={{
                          backgroundColor: '#0ea5e9',
                          color: 'white',
                          p: 1,
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {testimonial.metrics.icon}
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0ea5e9' }}>
                          {testimonial.metrics.value}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                          {testimonial.metrics.description}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Información del autor */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{
                          width: 50,
                          height: 50,
                          backgroundColor: '#6366f1',
                          fontSize: '1.2rem',
                          fontWeight: 600
                        }}
                      >
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                          {testimonial.position}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6366f1', fontWeight: 500 }}>
                          {testimonial.company}
                        </Typography>
                      </Box>
                      <Stack spacing={0.5} alignItems="flex-end">
                        <Chip
                          label={testimonial.industry}
                          size="small"
                          sx={{ backgroundColor: '#f1f5f9', color: '#64748b', fontSize: '0.7rem' }}
                        />
                        <Chip
                          label={testimonial.companySize}
                          size="small"
                          sx={{ backgroundColor: '#f1f5f9', color: '#64748b', fontSize: '0.7rem' }}
                        />
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Empresas que confían en nosotros */}
        <Box
          sx={{
            p: 6,
            backgroundColor: '#f8fafc',
            borderRadius: 3,
            textAlign: 'center'
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: '#1e293b',
              mb: 1
            }}
          >
            Empresas que ya están automatizando
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: '#64748b',
              mb: 4
            }}
          >
            Únete a cientos de empresas que han modernizado sus procesos
          </Typography>

          <Grid container spacing={3} justifyContent="center">
            {companies.map((company, index) => (
              <Grid size={{ xs: 6, sm: 4, md: 2 }} key={index}>
                <Box
                  sx={{
                    p: 3,
                    backgroundColor: 'white',
                    borderRadius: 2,
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <Typography sx={{ fontSize: '2rem', mb: 1 }}>
                    {company.logo}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', mb: 0.5 }}>
                    {company.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    {company.industry}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default TestimonialsSection;
