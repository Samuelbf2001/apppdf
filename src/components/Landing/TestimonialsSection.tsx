import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Avatar, Rating } from '@mui/material';

const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      name: 'María González',
      company: 'TechStartup Madrid',
      quote: 'Hemos reducido 20 horas semanales en creación de propuestas.',
      rating: 5
    },
    {
      name: 'Carlos Ruiz',
      company: 'Inmobiliaria Barcelona',
      quote: 'Ahora procesamos el doble de transacciones con el mismo equipo.',
      rating: 5
    }
  ];

  return (
    <Box sx={{ py: 8, backgroundColor: 'white' }}>
      <Container maxWidth="lg">
        <Typography variant="h2" align="center" sx={{ mb: 6, fontWeight: 700 }}>
          Lo que dicen nuestros clientes
        </Typography>
        <Grid container spacing={4}>
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card sx={{ height: '100%', p: 3 }}>
                <CardContent>
                  <Rating value={testimonial.rating} readOnly sx={{ mb: 2 }} />
                  <Typography variant="body1" sx={{ mb: 3, fontStyle: 'italic' }}>
                    "{testimonial.quote}"
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar>{testimonial.name[0]}</Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {testimonial.company}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default TestimonialsSection;
