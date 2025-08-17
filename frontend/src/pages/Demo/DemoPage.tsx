import React from 'react';
import {
  Box,
  Container,
  Typography,
  Alert,
  Button,
  Stack,
} from '@mui/material';
import { Code, Visibility, Build } from '@mui/icons-material';

import DemoTemplateBuilder from '../../components/Demo/DemoTemplateBuilder';

/**
 * Página de demostración del Constructor Visual
 */
const DemoPage: React.FC = () => {
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header informativo */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 2 }}>
        <Container maxWidth="xl">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" fontWeight={600}>
                🧪 MODO DEMOSTRACIÓN - Constructor Visual de Templates PDF
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Funcionalidad completa con datos simulados de HubSpot
              </Typography>
            </Box>
            
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Code />}
                sx={{ color: 'white', borderColor: 'white' }}
                href="/demo.html"
                target="_blank"
              >
                Demo HTML
              </Button>
              
              <Button
                variant="outlined"
                size="small"
                startIcon={<Build />}
                sx={{ color: 'white', borderColor: 'white' }}
              >
                React Version
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Contenido principal */}
      <Box sx={{ flexGrow: 1 }}>
        <DemoTemplateBuilder />
      </Box>
    </Box>
  );
};

export default DemoPage;
