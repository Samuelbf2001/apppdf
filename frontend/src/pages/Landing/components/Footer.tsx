import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Stack,
  Link,
  IconButton,
  Divider,
  Chip
} from '@mui/material';
import {
  Email,
  Phone,
  LocationOn,
  LinkedIn,
  Twitter,
  GitHub,
  Language,
  Security,
  Speed,
  Support
} from '@mui/icons-material';

/**
 * Footer de la landing page
 * Incluye información de contacto, enlaces legales y sociales
 * Diseñado para completar la información y generar confianza
 */
const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Producto',
      links: [
        { text: 'Características', href: '#features' },
        { text: 'Precios', href: '#pricing' },
        { text: 'Demo en vivo', href: '/demo' },
        { text: 'Integraciones', href: '#integrations' },
        { text: 'API Documentation', href: '/api-docs' },
        { text: 'Plantillas', href: '/templates' }
      ]
    },
    {
      title: 'Empresa',
      links: [
        { text: 'Sobre nosotros', href: '/about' },
        { text: 'Blog', href: '/blog' },
        { text: 'Casos de éxito', href: '/case-studies' },
        { text: 'Carreras', href: '/careers' },
        { text: 'Prensa', href: '/press' },
        { text: 'Partners', href: '/partners' }
      ]
    },
    {
      title: 'Soporte',
      links: [
        { text: 'Centro de ayuda', href: '/help' },
        { text: 'Documentación', href: '/docs' },
        { text: 'Guías de inicio', href: '/getting-started' },
        { text: 'Contacto', href: '/contact' },
        { text: 'Estado del sistema', href: '/status' },
        { text: 'Reportar bug', href: '/bug-report' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { text: 'Términos de servicio', href: '/terms' },
        { text: 'Política de privacidad', href: '/privacy' },
        { text: 'Política de cookies', href: '/cookies' },
        { text: 'GDPR', href: '/gdpr' },
        { text: 'Seguridad', href: '/security' },
        { text: 'Cumplimiento', href: '/compliance' }
      ]
    }
  ];

  const socialLinks = [
    { icon: <LinkedIn />, href: 'https://linkedin.com/company/automaticpdfhub', label: 'LinkedIn' },
    { icon: <Twitter />, href: 'https://twitter.com/automaticpdfhub', label: 'Twitter' },
    { icon: <GitHub />, href: 'https://github.com/automaticpdfhub', label: 'GitHub' }
  ];

  const trustBadges = [
    {
      icon: <Security sx={{ fontSize: 20 }} />,
      text: 'SOC2 Compliant',
      color: '#10b981'
    },
    {
      icon: <Speed sx={{ fontSize: 20 }} />,
      text: '99.9% Uptime',
      color: '#6366f1'
    },
    {
      icon: <Support sx={{ fontSize: 20 }} />,
      text: 'Soporte 24/7',
      color: '#f59e0b'
    }
  ];

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#1e293b',
        color: 'white',
        pt: 8,
        pb: 4
      }}
    >
      <Container maxWidth="lg">
        {/* Sección principal del footer */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {/* Información de la empresa */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              {/* Logo y descripción */}
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  AutomaticPDFHub
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#94a3b8',
                    lineHeight: 1.6,
                    mb: 3,
                    maxWidth: 280
                  }}
                >
                  La plataforma líder para automatizar la generación de documentos PDF 
                  con integración completa a HubSpot. Escalable, segura y fácil de usar.
                </Typography>
              </Box>

              {/* Información de contacto */}
              <Stack spacing={2}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'white' }}>
                  Contacto
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Email sx={{ fontSize: 18, color: '#94a3b8' }} />
                  <Link 
                    href="mailto:hola@automaticpdfhub.com" 
                    sx={{ color: '#94a3b8', textDecoration: 'none', '&:hover': { color: 'white' } }}
                  >
                    hola@automaticpdfhub.com
                  </Link>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Phone sx={{ fontSize: 18, color: '#94a3b8' }} />
                  <Link 
                    href="tel:+34900123456" 
                    sx={{ color: '#94a3b8', textDecoration: 'none', '&:hover': { color: 'white' } }}
                  >
                    +34 900 123 456
                  </Link>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <LocationOn sx={{ fontSize: 18, color: '#94a3b8', mt: 0.2 }} />
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                    Madrid, España<br />
                    Barcelona, España
                  </Typography>
                </Box>
              </Stack>

              {/* Badges de confianza */}
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {trustBadges.map((badge, index) => (
                  <Chip
                    key={index}
                    icon={badge.icon}
                    label={badge.text}
                    size="small"
                    sx={{
                      backgroundColor: `${badge.color}20`,
                      color: badge.color,
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      '& .MuiChip-icon': { color: badge.color }
                    }}
                  />
                ))}
              </Stack>
            </Stack>
          </Grid>

          {/* Enlaces de navegación */}
          {footerSections.map((section, index) => (
            <Grid item xs={6} sm={6} md={2} key={index}>
              <Stack spacing={2}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: 'white',
                    mb: 1
                  }}
                >
                  {section.title}
                </Typography>
                
                <Stack spacing={1.5}>
                  {section.links.map((link, linkIndex) => (
                    <Link
                      key={linkIndex}
                      href={link.href}
                      sx={{
                        color: '#94a3b8',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        transition: 'color 0.2s ease',
                        '&:hover': {
                          color: 'white'
                        }
                      }}
                    >
                      {link.text}
                    </Link>
                  ))}
                </Stack>
              </Stack>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ borderColor: '#334155', mb: 4 }} />

        {/* Sección inferior */}
        <Grid container spacing={4} alignItems="center" justifyContent="space-between">
          {/* Copyright y enlaces legales */}
          <Grid item xs={12} md={8}>
            <Stack spacing={2}>
              <Typography
                variant="body2"
                sx={{ color: '#94a3b8' }}
              >
                © {currentYear} AutomaticPDFHub. Todos los derechos reservados.
              </Typography>
              
              <Stack direction="row" spacing={3} flexWrap="wrap">
                <Link href="/privacy" sx={{ color: '#94a3b8', fontSize: '0.8rem', '&:hover': { color: 'white' } }}>
                  Privacidad
                </Link>
                <Link href="/terms" sx={{ color: '#94a3b8', fontSize: '0.8rem', '&:hover': { color: 'white' } }}>
                  Términos
                </Link>
                <Link href="/cookies" sx={{ color: '#94a3b8', fontSize: '0.8rem', '&:hover': { color: 'white' } }}>
                  Cookies
                </Link>
                <Link href="/security" sx={{ color: '#94a3b8', fontSize: '0.8rem', '&:hover': { color: 'white' } }}>
                  Seguridad
                </Link>
              </Stack>
            </Stack>
          </Grid>

          {/* Redes sociales y configuración */}
          <Grid item xs={12} md={4}>
            <Stack direction="row" spacing={1} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
              {/* Redes sociales */}
              {socialLinks.map((social, index) => (
                <IconButton
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: '#94a3b8',
                    '&:hover': {
                      color: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                  aria-label={social.label}
                >
                  {social.icon}
                </IconButton>
              ))}
              
              {/* Selector de idioma */}
              <IconButton
                sx={{
                  color: '#94a3b8',
                  '&:hover': {
                    color: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
                aria-label="Cambiar idioma"
              >
                <Language />
              </IconButton>
            </Stack>
          </Grid>
        </Grid>

        {/* Nota de desarrollo */}
        <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #334155' }}>
          <Typography
            variant="caption"
            sx={{
              color: '#64748b',
              display: 'block',
              textAlign: 'center',
              fontSize: '0.75rem'
            }}
          >
            💻 Desarrollado con React, TypeScript y Material-UI • 
            🚀 Desplegado en la nube con alta disponibilidad • 
            🔒 Certificado SOC2 y cumplimiento GDPR
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
