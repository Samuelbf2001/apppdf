import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery,
  Container,
  Fade,
  Chip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Login,
  PlayArrow
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

/**
 * Componente de navegación para la landing page
 * Incluye navegación responsive, scroll effects y CTAs destacados
 * Optimizado para conversión y experiencia de usuario
 */
const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Detectar scroll para cambiar estilo del navbar
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogin = () => {
    navigate('/auth/login');
  };

  const handleDemo = () => {
    navigate('/demo');
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
    setMobileOpen(false);
  };

  const navigationItems: any[] = [];

  const mobileDrawer = (
    <Box sx={{ width: 280, pt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
          AutomaticPDFHub
        </Typography>
        <IconButton onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>
      
      <List>
        {navigationItems.map((item, index) => (
          <ListItem key={index} onClick={item.action} sx={{ cursor: 'pointer' }}>
            <ListItemText 
              primary={item.label}
              primaryTypographyProps={{
                fontWeight: 500,
                color: '#64748b'
              }}
            />
          </ListItem>
        ))}
        
        <ListItem sx={{ mt: 2, px: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<PlayArrow />}
            onClick={handleDemo}
            sx={{
              borderColor: '#6366f1',
              color: '#6366f1',
              fontWeight: 600,
              py: 1.5,
              textTransform: 'none'
            }}
          >
            Ver Demo
          </Button>
        </ListItem>
        
        <ListItem sx={{ px: 2 }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<Login />}
            onClick={handleLogin}
            sx={{
              backgroundColor: '#6366f1',
              fontWeight: 600,
              py: 1.5,
              textTransform: 'none'
            }}
          >
            Iniciar Sesión
          </Button>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        elevation={isScrolled ? 2 : 0}
        sx={{
          backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
          backdropFilter: isScrolled ? 'blur(20px)' : 'none',
          borderBottom: isScrolled ? '1px solid rgba(0,0,0,0.1)' : 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          color: isScrolled ? '#1e293b' : 'white'
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ px: { xs: 0, sm: 2 } }}>
            {/* Logo */}
            <Typography
              variant="h6"
              component="div"
              sx={{
                flexGrow: 1,
                fontWeight: 700,
                fontSize: '1.5rem',
                background: isScrolled 
                  ? 'linear-gradient(45deg, #6366f1, #8b5cf6)'
                  : 'linear-gradient(45deg, #ffffff, #e2e8f0)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                cursor: 'pointer'
              }}
              onClick={() => scrollToSection('hero')}
            >
              AutomaticPDFHub
            </Typography>

            {/* Badge de nuevo/beta */}
            <Fade in={!isMobile}>
              <Chip
                label="NUEVO"
                size="small"
                sx={{
                  backgroundColor: '#ff6b6b',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  mr: 2,
                  display: { xs: 'none', sm: 'flex' }
                }}
              />
            </Fade>

            {/* Navegación desktop */}
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {navigationItems.map((item, index) => (
                  <Button
                    key={index}
                    onClick={item.action}
                    sx={{
                      color: 'inherit',
                      fontWeight: 500,
                      textTransform: 'none',
                      px: 2,
                      '&:hover': {
                        backgroundColor: isScrolled 
                          ? 'rgba(99, 102, 241, 0.1)' 
                          : 'rgba(255, 255, 255, 0.1)'
                      }
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
                
                <Button
                  variant="outlined"
                  startIcon={<PlayArrow />}
                  onClick={handleDemo}
                  sx={{
                    ml: 2,
                    borderColor: isScrolled ? '#6366f1' : 'rgba(255,255,255,0.7)',
                    color: isScrolled ? '#6366f1' : 'white',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: isScrolled ? '#4f46e5' : 'white',
                      backgroundColor: isScrolled 
                        ? 'rgba(99, 102, 241, 0.1)' 
                        : 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  Demo
                </Button>
                
                <Button
                  variant="contained"
                  startIcon={<Login />}
                  onClick={handleLogin}
                  sx={{
                    ml: 1,
                    backgroundColor: isScrolled ? '#6366f1' : '#ff6b6b',
                    '&:hover': {
                      backgroundColor: isScrolled ? '#4f46e5' : '#ff5252'
                    },
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                  }}
                >
                  Entrar
                </Button>
              </Box>
            )}

            {/* Menú mobile */}
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Drawer para móvil */}
      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Mejor rendimiento en móvil
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
          },
        }}
      >
        {mobileDrawer}
      </Drawer>

      {/* Spacer para compensar el AppBar fijo */}
      <Toolbar />
    </>
  );
};

export default Navigation;
