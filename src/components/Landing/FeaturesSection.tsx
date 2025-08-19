import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent } from '@mui/material';
import { EditNote, PictureAsPdf, Autorenew, CloudUpload } from '@mui/icons-material';

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: <EditNote sx={{ fontSize: 40, color: '#6366f1' }} />,
      title: 'Editor Avanzado',
      description: 'Editor WYSIWYG con variables de HubSpot'
    },
    {
      icon: <PictureAsPdf sx={{ fontSize: 40, color: '#ec4899' }} />,
      title: 'Conversión PDF',
      description: 'Convierte documentos a PDF automáticamente'
    },
    {
      icon: <Autorenew sx={{ fontSize: 40, color: '#10b981' }} />,
      title: 'Workflows',
      description: 'Integración con workflows de HubSpot'
    },
    {
      icon: <CloudUpload sx={{ fontSize: 40, color: '#f59e0b' }} />,
      title: 'Subida Automática',
      description: 'Sube archivos a HubSpot automáticamente'
    }
  ];

  return (
    <Box sx={{ py: 8, backgroundColor: 'white' }}>
      <Container maxWidth="lg">
        <Typography variant="h2" align="center" sx={{ mb: 6, fontWeight: 700 }}>
          Características Principales
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} lg={3} key={index}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
                <CardContent>
                  {feature.icon}
                  <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default FeaturesSection;
