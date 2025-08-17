import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
} from '@mui/material';

/**
 * Página de integración con HubSpot
 */
const HubSpotIntegrationPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
        Integración HubSpot
      </Typography>
      
      <Card>
        <CardContent>
          <Alert severity="info">
            Página en desarrollo. Aquí se configurará la integración con HubSpot.
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
};

export default HubSpotIntegrationPage;
