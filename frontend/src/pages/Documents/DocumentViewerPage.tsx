import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
} from '@mui/material';

/**
 * Visor de documentos individuales
 */
const DocumentViewerPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
        Ver Documento
      </Typography>
      
      <Card>
        <CardContent>
          <Alert severity="info">
            Página en desarrollo. Aquí se mostrará el detalle y preview del documento.
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DocumentViewerPage;
