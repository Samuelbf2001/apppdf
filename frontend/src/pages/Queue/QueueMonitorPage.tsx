import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
} from '@mui/material';

/**
 * Página de monitoreo de colas
 */
const QueueMonitorPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
        Monitor de Colas
      </Typography>
      
      <Card>
        <CardContent>
          <Alert severity="info">
            Página en desarrollo. Aquí se monitoreará el estado de las colas de procesamiento.
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
};

export default QueueMonitorPage;
