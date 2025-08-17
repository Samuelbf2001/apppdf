import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
} from '@mui/material';

/**
 * Página de configuraciones
 */
const SettingsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
        Configuración
      </Typography>
      
      <Card>
        <CardContent>
          <Alert severity="info">
            Página en desarrollo. Aquí se configurarán las preferencias del usuario y tenant.
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SettingsPage;
