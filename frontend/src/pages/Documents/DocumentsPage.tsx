import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
} from '@mui/material';

/**
 * Página de documentos - Lista de documentos generados
 */
const DocumentsPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
        Documentos
      </Typography>
      
      <Card>
        <CardContent>
          <Alert severity="info">
            Página en desarrollo. Aquí se mostrará la lista de documentos PDF generados.
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DocumentsPage;
