import React from 'react';
import { Box, Container, Typography, Grid } from '@mui/material';

const BenefitsSection: React.FC = () => {
  return (
    <Box sx={{ py: 8, backgroundColor: '#f8fafc' }}>
      <Container maxWidth="lg">
        <Typography variant="h2" align="center" sx={{ mb: 6, fontWeight: 700 }}>
          Beneficios Comprobados
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#10b981', mb: 2 }}>
              95%
            </Typography>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Menos tiempo
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Elimina la creación manual de documentos
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#6366f1', mb: 2 }}>
              +40%
            </Typography>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Más conversión
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Documentos entregados al instante
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#f59e0b', mb: 2 }}>
              99.9%
            </Typography>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Precisión
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Variables automáticas desde HubSpot
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default BenefitsSection;
