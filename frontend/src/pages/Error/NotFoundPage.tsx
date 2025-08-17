import React from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  useTheme,
} from '@mui/material';
import { Home, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

/**
 * Página 404 - No encontrado
 */
const NotFoundPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: 3,
      }}
    >
      <Stack spacing={4} alignItems="center" maxWidth={600}>
        <Typography
          variant="h1"
          sx={{
            fontSize: '6rem',
            fontWeight: 700,
            color: theme.palette.primary.main,
            textShadow: `2px 2px 4px ${theme.palette.primary.main}20`,
          }}
        >
          404
        </Typography>

        <Stack spacing={2} textAlign="center">
          <Typography variant="h4" fontWeight={600} color="text.primary">
            Página No Encontrada
          </Typography>
          <Typography variant="body1" color="text.secondary">
            La página que buscas no existe o ha sido movida.
            Verifica la URL o regresa al inicio.
          </Typography>
        </Stack>

        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={<Home />}
            onClick={() => navigate('/dashboard')}
            size="large"
          >
            Ir al Dashboard
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            size="large"
          >
            Regresar
          </Button>
        </Stack>

        <Typography variant="caption" color="text.secondary">
          Si crees que esto es un error, contacta al soporte técnico.
        </Typography>
      </Stack>
    </Box>
  );
};

export default NotFoundPage;
