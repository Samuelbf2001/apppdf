import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Stack,
  Chip,
  Avatar,
  Rating
} from '@mui/material';
import {
  PlayArrow,
  Check,
  Speed,
  Security,
  ConnectWithoutContact
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

/**
 * Sección Hero principal de la landing page
 * Contiene el mensaje principal, propuesta de valor y CTA primario
 * Diseñada para máxima conversión e impacto visual
 */
const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/auth/login');
  };

  const handleWatchDemo = () => {
    // Por ahora navega al demo, más adelante se puede añadir un modal con video
    navigate('/demo');
  };

  return (
    <Box
      id="hero"
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        py: { xs: 8, md: 12 },
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Elementos decorativos de fondo */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={4} alignItems="center">
          {/* Contenido principal */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={4}>


              {/* Título principal */}
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  fontWeight: 700,
                  lineHeight: 1.2,
                  mb: 2
                }}
              >
                Genera PDFs Automáticamente
                <Typography
                  component="span"
                  sx={{
                    display: 'block',
                    fontSize: { xs: '2rem', md: '2.8rem' },
                    background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 800
                  }}
                >
                  desde HubSpot
                </Typography>
              </Typography>

              {/* Subtítulo/descripción */}
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: '1.1rem', md: '1.3rem' },
                  opacity: 0.9,
                  lineHeight: 1.6,
                  maxWidth: '90%'
                }}
              >
                Editor avanzado de documentos con variables dinámicas de HubSpot. 
                Convierte automáticamente a PDF y sube los archivos a tus contactos y deals.
              </Typography>

              {/* Lista de características destacadas */}
              <Stack spacing={1.5}>
                {[
                  'Editor tipo Word con variables de HubSpot',
                  'Conversión automática a PDF',
                  'Integración nativa con workflows',
                  'Subida automática de archivos'
                ].map((feature, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Check 
                      sx={{ 
                        color: '#4ade80',
                        fontSize: '1.2rem',
                        backgroundColor: 'rgba(74, 222, 128, 0.2)',
                        borderRadius: '50%',
                        p: 0.3
                      }} 
                    />
                    <Typography sx={{ fontSize: '0.95rem' }}>
                      {feature}
                    </Typography>
                  </Box>
                ))}
              </Stack>

              {/* Botones de acción */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleGetStarted}
                  sx={{
                    backgroundColor: '#ff6b6b',
                    '&:hover': { backgroundColor: '#ff5252' },
                    py: 1.5,
                    px: 4,
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    boxShadow: '0 8px 25px rgba(255, 107, 107, 0.3)'
                  }}
                >
                  Comenzar Gratis
                </Button>
                
                <Button
                  id="demo"
                  variant="outlined"
                  size="large"
                  startIcon={<PlayArrow />}
                  onClick={handleWatchDemo}
                  sx={{
                    borderColor: 'rgba(255,255,255,0.5)',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    },
                    py: 1.5,
                    px: 4,
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    textTransform: 'none'
                  }}
                >
                  Ver Demo
                </Button>
              </Stack>

              {/* Indicadores de confianza */}
              <Stack direction="row" spacing={3} alignItems="center" sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Rating value={5} readOnly size="small" />
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    5.0 estrellas
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Más de 500 empresas confían en nosotros
                </Typography>
              </Stack>
            </Stack>
          </Grid>

                                                      {/* Mockups replicando la imagen de referencia */}
           <Grid size={{ xs: 12, md: 6 }}>
             <Box sx={{ 
               position: 'relative',
               display: 'flex', 
               flexDirection: { xs: 'column', lg: 'row' },
               gap: { xs: 3, lg: 2 },
               height: '100%',
               justifyContent: 'center',
               alignItems: 'flex-start',
               py: { xs: 2, md: 3 }
             }}>
               
               {/* ELEMENTO 1: Workflow de HubSpot (estilo imagen de referencia) */}
            <Box
              sx={{
                position: 'relative',
                   width: '100%',
                   maxWidth: { xs: 320, lg: 280 },
                   flex: { lg: '1' }
              }}
            >
              <Box
                sx={{
                  backgroundColor: 'white',
                     borderRadius: 4,
                     p: 3,
                     boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                     border: '1px solid rgba(0,0,0,0.05)',
                     display: 'flex',
                     flexDirection: 'column',
                     gap: 2,
                     minHeight: 400
                   }}
                 >
                                                         {/* Header del workflow (estilo imagen de referencia) */}
                   <Box sx={{ 
                     display: 'flex', 
                     alignItems: 'center', 
                     gap: 2,
                     mb: 3
                   }}>
                     <Box sx={{ 
                       width: 40, 
                       height: 40, 
                       borderRadius: '50%', 
                       backgroundColor: '#ff7043',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       color: 'white',
                       fontSize: '20px'
                     }}>
                       🔍
                     </Box>
                     <Typography variant="h6" sx={{ 
                       fontWeight: 700, 
                       fontSize: '1.1rem', 
                       color: '#111'
                     }}>
                       Create Offer Campaign
                     </Typography>
                </Box>

                                      {/* Workflow Steps (estilo imagen de referencia) */}
                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                     
                     {/* Step 1: Send Email */}
                     <Box sx={{
                       backgroundColor: '#2E86AB',
                       color: 'white',
                       borderRadius: 3,
                       p: 3,
                       textAlign: 'center',
                       boxShadow: '0 8px 20px rgba(46,134,171,0.3)'
                     }}>
                       <Box sx={{ fontSize: '24px', mb: 1 }}>✉️</Box>
                       <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem', mb: 0.5 }}>
                         Send email
                       </Typography>
                       <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.9rem' }}>
                         Nurture Email
                       </Typography>
                     </Box>

                     {/* Arrow */}
                     <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
                       <Box sx={{ fontSize: '24px', color: '#666' }}>↓</Box>
                     </Box>

                     {/* Step 2: If/Then Branch */}
                     <Box sx={{
                       backgroundColor: '#7B4397',
                       color: 'white',
                  borderRadius: 3,
                  p: 3,
                       textAlign: 'center',
                       boxShadow: '0 8px 20px rgba(123,67,151,0.3)'
                     }}>
                       <Box sx={{ fontSize: '24px', mb: 1 }}>⚙️</Box>
                       <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem', mb: 0.5 }}>
                         If/Then branch
                       </Typography>
                       <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.9rem' }}>
                         Contact known
                       </Typography>
                     </Box>

                     {/* Arrow */}
                     <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
                       <Box sx={{ fontSize: '24px', color: '#666' }}>↓</Box>
                     </Box>
                   </Box>
              </Box>

                                                   {/* Badge HubSpot Workflow */}
                 <Box
                   sx={{
                     position: 'absolute',
                     top: -12,
                     left: '50%',
                     transform: 'translateX(-50%)',
                     backgroundColor: '#ff7043',
                     color: 'white',
                     borderRadius: 2,
                     px: 2,
                     py: 0.5,
                     fontSize: '0.75rem',
                     fontWeight: 600,
                     boxShadow: '0 4px 12px rgba(255,112,67,0.3)',
                     zIndex: 10
                   }}
                 >
                   🔄 HubSpot Workflow
                 </Box>
               </Box>

               {/* AutomaticPDFHub - Elemento separado (estilo imagen de referencia) */}
               <Box
                 sx={{
                   position: 'absolute',
                   bottom: { xs: -80, lg: -60 },
                   left: { xs: '50%', lg: '25%' },
                   transform: { xs: 'translateX(-50%)', lg: 'translateX(-50%)' },
                   zIndex: 5
                 }}
               >
                 <Box sx={{
                   backgroundColor: '#ff7043',
                   color: 'white',
                   borderRadius: 4,
                   p: 3,
                   textAlign: 'center',
                   boxShadow: '0 12px 24px rgba(255,112,67,0.4)',
                   minWidth: 220,
                   border: '2px solid rgba(255,255,255,0.2)'
                 }}>
                   <Box sx={{ fontSize: '28px', mb: 1 }}>📄</Box>
                   <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.2rem', mb: 0.5 }}>
                     AutomatiPDFHub
                   </Typography>
                   <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.9rem' }}>
                     Generate PDF
                   </Typography>
                 </Box>
               </Box>

                              {/* ELEMENTO 2: Editor de Documentos (estilo imagen de referencia) */}
               <Box
                 sx={{
                   position: 'relative',
                   width: '100%',
                   maxWidth: { xs: 320, lg: 280 },
                   flex: { lg: '1' }
                 }}
               >
                 <Box
                   sx={{
                     backgroundColor: 'white',
                     borderRadius: 4,
                     p: 3,
                     boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                     border: '1px solid rgba(0,0,0,0.05)',
                     display: 'flex',
                     flexDirection: 'column',
                     gap: 3,
                     minHeight: 400
                   }}
                 >
                                      {/* Header del editor (estilo imagen de referencia) */}
                   <Box sx={{ 
                     display: 'flex', 
                     alignItems: 'center', 
                     gap: 2
                   }}>
                     <Box sx={{ 
                       width: 40, 
                       height: 40, 
                       borderRadius: '8px', 
                       backgroundColor: '#ff7043',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       color: 'white',
                       fontSize: '20px'
                     }}>
                       📄
                     </Box>
                     <Typography variant="h6" sx={{ 
                       fontWeight: 700, 
                       fontSize: '1.1rem', 
                       color: '#111'
                     }}>
                       Document Editor
                     </Typography>
                </Box>

                                                         {/* Preview del documento (estilo imagen de referencia) */}
                   <Box sx={{ 
                     backgroundColor: '#f8f9fa',
                     borderRadius: 2,
                     p: 3,
                     border: '1px solid #e9ecef',
                     flex: 1
                   }}>
                     <Typography variant="body1" sx={{ 
                       fontSize: '1rem', 
                       lineHeight: 1.6, 
                       color: '#333',
                       mb: 2
                     }}>
                       Dear <Box component="span" sx={{ 
                         color: '#2E86AB',
                         fontWeight: 600
                       }}>
                         {'{contact.firstname}'}
                       </Box>,
                     </Typography>
                     
                     <Typography variant="body1" sx={{ 
                       fontSize: '1rem', 
                       lineHeight: 1.6, 
                       color: '#333',
                       mb: 2
                     }}>
                       Proposal for <Box component="span" sx={{ 
                         color: '#2E86AB',
                         fontWeight: 600
                       }}>
                         {'{deal.amount}'}
                       </Box>
                  </Typography>
                  
                     <Typography variant="body1" sx={{ 
                       fontSize: '1rem', 
                       lineHeight: 1.6, 
                       color: '#333'
                     }}>
                       Company: <Box component="span" sx={{ 
                         color: '#ff7043',
                         fontWeight: 600
                       }}>
                         {'{company.name}'}
                       </Box>
                     </Typography>
                   </Box>

                                      {/* Available Properties (estilo imagen de referencia) */}
                   <Box>
                     <Typography variant="body2" sx={{ 
                       color: '#666', 
                       fontSize: '0.9rem', 
                       fontWeight: 500,
                       mb: 2
                     }}>
                       Available Properties:
                     </Typography>
                     <Box sx={{ 
                       display: 'flex', 
                       gap: 1, 
                       flexWrap: 'wrap'
                     }}>
                       <Box sx={{
                         backgroundColor: '#e9ecef',
                         color: '#495057',
                         px: 2,
                         py: 1,
                         borderRadius: 2,
                         fontSize: '0.85rem',
                         fontWeight: 500
                       }}>
                         company.industry
                       </Box>
                       <Box sx={{
                         backgroundColor: '#e9ecef',
                         color: '#495057',
                         px: 2,
                         py: 1,
                         borderRadius: 2,
                         fontSize: '0.85rem',
                         fontWeight: 500
                       }}>
                         deal.close_date
                       </Box>
                     </Box>
                   </Box>
              </Box>

                                  {/* Badge Document Editor */}
                 <Box
                   sx={{
                     position: 'absolute',
                     top: -12,
                     left: '50%',
                     transform: 'translateX(-50%)',
                     backgroundColor: '#2E86AB',
                     color: 'white',
                     borderRadius: 2,
                     px: 2,
                     py: 0.5,
                     fontSize: '0.75rem',
                     fontWeight: 600,
                     boxShadow: '0 4px 12px rgba(46,134,171,0.3)',
                     zIndex: 10
                   }}
                 >
                   📝 Document Editor
                 </Box>
                  </Box>
                  
                              {/* Elementos flotantes reorganizados para layout lado a lado */}
               
                                             {/* Feature flotante: Instant generation */}
               <Box
                 sx={{
                   position: 'absolute',
                   top: { xs: '10%', lg: '15%' },
                   right: { xs: '-5%', md: '-8%', lg: '-12%' },
                   backgroundColor: 'white',
                   borderRadius: 3,
                   p: 2,
                   display: { xs: 'none', md: 'flex' },
                   alignItems: 'center',
                   gap: 1,
                   boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                   minWidth: 140,
                   zIndex: 6
                 }}
               >
                  <Box sx={{ 
                   width: 32,
                   height: 32,
                   borderRadius: '50%',
                   backgroundColor: '#4ade80',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                   <Box sx={{ fontSize: '16px' }}>⚡</Box>
                 </Box>
                 <Typography variant="body2" sx={{ 
                   color: '#111', 
                   fontWeight: 600, 
                   fontSize: '0.8rem'
                 }}>
                   Instant generation
                    </Typography>
              </Box>

                                             {/* Feature flotante: HubSpot Integration */}
              <Box
                sx={{
                  position: 'absolute',
                   top: { xs: '35%', lg: '40%' },
                   left: { xs: '-5%', md: '-8%', lg: '-12%' },
                   backgroundColor: 'white',
                   borderRadius: 3,
                   p: 2,
                   display: { xs: 'none', md: 'flex' },
                  alignItems: 'center',
                   gap: 1,
                   boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                   minWidth: 140,
                   zIndex: 6
                 }}
               >
                 <Box sx={{
                   width: 32,
                   height: 32,
                   borderRadius: '50%',
                   backgroundColor: '#ff6b6b',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center'
                 }}>
                   <Box sx={{ fontSize: '16px' }}>🔗</Box>
                 </Box>
                 <Typography variant="body2" sx={{ 
                   color: '#111', 
                   fontWeight: 600, 
                   fontSize: '0.8rem'
                 }}>
                   HubSpot Integration
                </Typography>
              </Box>

               {/* Feature flotante: 100% Automated */}
              <Box
                sx={{
                  position: 'absolute',
                   bottom: { xs: '15%', lg: '20%' },
                   right: { xs: '-5%', md: '-8%', lg: '-12%' },
                   backgroundColor: 'white',
                   borderRadius: 3,
                   p: 2,
                   display: { xs: 'none', md: 'flex' },
                  alignItems: 'center',
                   gap: 1,
                   boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                   minWidth: 140,
                   zIndex: 6
                 }}
               >
                 <Box sx={{
                   width: 32,
                   height: 32,
                   borderRadius: '50%',
                   backgroundColor: '#333',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center'
                 }}>
                   <Box sx={{ fontSize: '16px', color: 'white' }}>✓</Box>
                 </Box>
                 <Typography variant="body2" sx={{ 
                   color: '#111', 
                   fontWeight: 600, 
                   fontSize: '0.8rem'
                 }}>
                   100% Automated
                </Typography>
              </Box>

            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HeroSection;
