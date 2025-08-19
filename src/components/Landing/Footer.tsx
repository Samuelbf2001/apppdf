import React from 'react';
import { Box, Container, Typography, Grid, Link } from '@mui/material';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box sx={{ backgroundColor: '#1e293b', color: 'white', py: 6 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              AutomaticPDFHub
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              La plataforma líder para automatizar la generación de documentos PDF 
              con integración completa a HubSpot.
            </Typography>
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Producto
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="#features" color="inherit" underline="hover">Características</Link>
              <Link href="#pricing" color="inherit" underline="hover">Precios</Link>
              <Link href="#" color="inherit" underline="hover">Demo</Link>
            </Box>
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Empresa
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="#" color="inherit" underline="hover">Sobre nosotros</Link>
              <Link href="#" color="inherit" underline="hover">Blog</Link>
              <Link href="#" color="inherit" underline="hover">Carreras</Link>
            </Box>
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Soporte
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="#" color="inherit" underline="hover">Centro de ayuda</Link>
              <Link href="#" color="inherit" underline="hover">Contacto</Link>
              <Link href="#" color="inherit" underline="hover">Estado del sistema</Link>
            </Box>
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Legal
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="#" color="inherit" underline="hover">Términos</Link>
              <Link href="#" color="inherit" underline="hover">Privacidad</Link>
              <Link href="#" color="inherit" underline="hover">Cookies</Link>
            </Box>
          </Grid>
        </Grid>
        <Box sx={{ mt: 4, pt: 4, borderTop: '1px solid #334155' }}>
          <Typography variant="body2" color="text.secondary" align="center">
            © {currentYear} AutomaticPDFHub. Todos los derechos reservados.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
