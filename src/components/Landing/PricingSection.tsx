import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Button } from '@mui/material';

const PricingSection: React.FC = () => {
  const plans = [
    {
      name: 'Starter',
      price: '€29',
      features: ['100 documentos/mes', 'Editor básico', 'Soporte email']
    },
    {
      name: 'Professional',
      price: '€79',
      features: ['1,000 documentos/mes', 'Editor avanzado', 'Soporte prioritario'],
      popular: true
    },
    {
      name: 'Enterprise',
      price: '€199',
      features: ['Documentos ilimitados', 'API personalizada', 'Soporte 24/7']
    }
  ];

  return (
    <Box sx={{ py: 8, backgroundColor: '#f8fafc' }}>
      <Container maxWidth="lg">
        <Typography variant="h2" align="center" sx={{ mb: 6, fontWeight: 700 }}>
          Planes que crecen contigo
        </Typography>
        <Grid container spacing={4}>
          {plans.map((plan, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ 
                height: '100%', 
                p: 3, 
                border: plan.popular ? '2px solid #6366f1' : '1px solid #e2e8f0',
                position: 'relative'
              }}>
                {plan.popular && (
                  <Box sx={{ 
                    position: 'absolute', 
                    top: -10, 
                    left: '50%', 
                    transform: 'translateX(-50%)',
                    backgroundColor: '#6366f1',
                    color: 'white',
                    px: 2,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: '0.8rem'
                  }}>
                    Más Popular
                  </Box>
                )}
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                    {plan.name}
                  </Typography>
                  <Typography variant="h3" sx={{ mb: 3, fontWeight: 700, color: '#6366f1' }}>
                    {plan.price}
                    <Typography component="span" variant="body1" color="text.secondary">
                      /mes
                    </Typography>
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    {plan.features.map((feature, idx) => (
                      <Typography key={idx} variant="body2" sx={{ mb: 1 }}>
                        ✓ {feature}
                      </Typography>
                    ))}
                  </Box>
                  <Button 
                    variant={plan.popular ? "contained" : "outlined"}
                    fullWidth
                    sx={{ py: 1.5 }}
                  >
                    Empezar Ahora
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default PricingSection;
