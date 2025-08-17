import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Stack,
  useTheme,
} from '@mui/material';

/**
 * Pantalla de carga reutilizable
 */
interface LoadingScreenProps {
  message?: string;
  size?: number;
  fullScreen?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Cargando...',
  size = 60,
  fullScreen = true,
}) => {
  const theme = useTheme();

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight={fullScreen ? '100vh' : '200px'}
      bgcolor={fullScreen ? 'background.default' : 'transparent'}
    >
      <Stack spacing={3} alignItems="center">
        <CircularProgress 
          size={size} 
          thickness={4}
          sx={{
            color: theme.palette.primary.main,
          }}
        />
        
        {message && (
          <Typography 
            variant="body1" 
            color="text.secondary"
            textAlign="center"
            sx={{ maxWidth: 300 }}
          >
            {message}
          </Typography>
        )}

        {/* Logo o título de la aplicación */}
        <Typography
          variant="h6"
          color="text.primary"
          fontWeight={600}
          sx={{ 
            mt: 2,
            opacity: 0.7,
            letterSpacing: 1,
          }}
        >
          HubSpot PDF Generator
        </Typography>
      </Stack>
    </Box>
  );
};

export default LoadingScreen;
