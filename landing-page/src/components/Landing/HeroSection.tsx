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

                                           {/* Mockups con distribución lado a lado */}
           <Grid size={{ xs: 12, md: 6 }}>
             <Box sx={{ 
               position: 'relative',
               display: 'flex', 
               flexDirection: { xs: 'column', lg: 'row' },
               gap: { xs: 4, md: 3, lg: 2 },
               height: '100%',
               justifyContent: 'center',
               alignItems: 'center',
               py: { xs: 2, md: 4 }
             }}>
               
               {/* ELEMENTO 1: Workflow de HubSpot */}
               <Box
                 sx={{
                   position: 'relative',
                   width: '100%',
                   maxWidth: { xs: 280, sm: 320, lg: 240 },
                   aspectRatio: { xs: '1.1/1', lg: '0.9/1' },
                   flex: { lg: '1' }
                 }}
               >
              <Box
                sx={{
                  backgroundColor: 'white',
                     borderRadius: { xs: 2, md: 3 },
                     p: { xs: 2.5, md: 3.5 },
                     boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                     transform: { xs: 'perspective(1000px) rotateY(-8deg) rotateX(3deg)', lg: 'perspective(1000px) rotateY(-5deg) rotateX(2deg)' },
                     transformOrigin: 'center center',
                     height: '100%',
                     display: 'flex',
                     flexDirection: 'column'
                   }}
                 >
                   {/* Header del workflow optimizado */}
                   <Box sx={{ 
                     display: 'flex', 
                     alignItems: 'center', 
                     gap: 1.5, 
                     mb: { xs: 2.5, md: 3 },
                     flexShrink: 0
                   }}>
                     <Box sx={{ 
                       width: { xs: 28, md: 32 }, 
                       height: { xs: 28, md: 32 }, 
                       borderRadius: '50%', 
                       backgroundColor: '#ff7043',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       color: 'white',
                       fontSize: { xs: '12px', md: '14px' },
                       fontWeight: 'bold'
                     }}>
                       👤
                     </Box>
                     <Typography variant="body2" sx={{ 
                       fontWeight: 600, 
                       fontSize: { xs: '0.8rem', md: '0.9rem' }, 
                       color: '#33475b',
                       lineHeight: 1.2
                     }}>
                       Create Offer Campaign
                     </Typography>
                </Box>

                   {/* Workflow Steps optimizado */}
                   <Box sx={{ 
                     display: 'flex', 
                     flexDirection: 'column', 
                     alignItems: 'center', 
                     gap: { xs: 1.5, md: 2 },
                     flex: 1,
                     justifyContent: 'center'
                   }}>
                     
                     {/* Step 1: Send Email */}
                     <Box sx={{
                       width: '100%',
                       maxWidth: { xs: 160, md: 180 },
                       aspectRatio: '2.2/1',
                       backgroundColor: '#0078d4',
                       color: 'white',
                       borderRadius: { xs: '4px', md: '6px' },
                       p: { xs: 1.5, md: 2 },
                       textAlign: 'center',
                       display: 'flex',
                       flexDirection: 'column',
                       alignItems: 'center',
                       justifyContent: 'center',
                       gap: 0.5
                     }}>
                       <Box sx={{ fontSize: { xs: '14px', md: '16px' } }}>📧</Box>
                       <Typography variant="body2" sx={{ 
                         fontWeight: 600, 
                         fontSize: { xs: '0.7rem', md: '0.75rem' },
                         lineHeight: 1
                       }}>
                         Send email
                       </Typography>
                       <Typography variant="caption" sx={{ 
                         fontSize: { xs: '0.6rem', md: '0.65rem' }, 
                         opacity: 0.9,
                         lineHeight: 1
                       }}>
                         Nurture Email
                  </Typography>
                     </Box>

                     {/* Conector optimizado */}
                     <Box sx={{ 
                       width: 2, 
                       height: { xs: 12, md: 16 }, 
                       backgroundColor: '#cbd6e2',
                       position: 'relative',
                       '&::after': {
                         content: '""',
                         position: 'absolute',
                         bottom: -3,
                         left: -2,
                         width: 0,
                         height: 0,
                         borderLeft: '3px solid transparent',
                         borderRight: '3px solid transparent',
                         borderTop: '5px solid #cbd6e2'
                       }
                     }} />

                     {/* Step 2: If/Then Branch */}
                     <Box sx={{
                       width: '100%',
                       maxWidth: { xs: 160, md: 180 },
                       aspectRatio: '2.2/1',
                       backgroundColor: '#00bfa6',
                       color: 'white',
                       borderRadius: { xs: '4px', md: '6px' },
                       p: { xs: 1.5, md: 2 },
                       textAlign: 'center',
                       display: 'flex',
                       flexDirection: 'column',
                       alignItems: 'center',
                       justifyContent: 'center',
                       gap: 0.5
                     }}>
                       <Box sx={{ fontSize: { xs: '14px', md: '16px' } }}>🔀</Box>
                       <Typography variant="body2" sx={{ 
                         fontWeight: 600, 
                         fontSize: { xs: '0.7rem', md: '0.75rem' },
                         lineHeight: 1
                       }}>
                         If/then branch
                       </Typography>
                       <Typography variant="caption" sx={{ 
                         fontSize: { xs: '0.6rem', md: '0.65rem' }, 
                         opacity: 0.9,
                         lineHeight: 1
                       }}>
                         Contact known
                       </Typography>
                  </Box>
                  
                     {/* Conector optimizado */}
                     <Box sx={{ 
                       width: 2, 
                       height: { xs: 12, md: 16 }, 
                       backgroundColor: '#cbd6e2',
                       position: 'relative',
                       '&::after': {
                         content: '""',
                         position: 'absolute',
                         bottom: -3,
                         left: -2,
                         width: 0,
                         height: 0,
                         borderLeft: '3px solid transparent',
                         borderRight: '3px solid transparent',
                         borderTop: '5px solid #cbd6e2'
                       }
                     }} />

                                          {/* Step 3: AutomaticPDFHub - Con z-index alto para sobreponerse */}
                     <Box sx={{
                       width: '100%',
                       maxWidth: { xs: 160, md: 180 },
                       aspectRatio: '2.2/1',
                       backgroundColor: '#ff7043',
                       color: 'white',
                       borderRadius: { xs: '4px', md: '6px' },
                       p: { xs: 1.5, md: 2 },
                       textAlign: 'center',
                       display: 'flex',
                       flexDirection: 'column',
                       alignItems: 'center',
                       justifyContent: 'center',
                       gap: 0.5,
                       border: '2px solid #ff5722',
                       boxShadow: '0 3px 8px rgba(255,112,67,0.25)'
                     }}>
                       <Box sx={{ fontSize: { xs: '14px', md: '16px' }, fontWeight: 'bold' }}>📄</Box>
                       <Typography variant="body2" sx={{ 
                         fontWeight: 600, 
                         fontSize: { xs: '0.7rem', md: '0.75rem' },
                         lineHeight: 1
                       }}>
                         AutomaticPDFHub
                       </Typography>
                       <Typography variant="caption" sx={{ 
                         fontSize: { xs: '0.6rem', md: '0.65rem' }, 
                         opacity: 0.9,
                         lineHeight: 1
                       }}>
                         Generate PDF
                       </Typography>
                     </Box>
                </Box>
              </Box>

                 {/* Badge optimizado */}
              <Box
                sx={{
                  position: 'absolute',
                     top: { xs: -8, md: -10 },
                     right: { xs: -8, md: -10 },
                     backgroundColor: '#ff7043',
                     color: 'white',
                     borderRadius: { xs: 1.5, md: 2 },
                     px: { xs: 1, md: 1.5 },
                     py: { xs: 0.25, md: 0.5 },
                     fontSize: { xs: '0.6rem', md: '0.7rem' },
                     fontWeight: 600,
                     boxShadow: '0 3px 8px rgba(255,112,67,0.3)',
                     whiteSpace: 'nowrap'
                   }}
                 >
                   HubSpot Workflow
                 </Box>
               </Box>

               {/* ELEMENTO 2: Editor de Documentos */}
               <Box
                 sx={{
                   position: 'relative',
                   width: '100%',
                   maxWidth: { xs: 280, sm: 320, lg: 240 },
                   aspectRatio: { xs: '1.1/1', lg: '0.9/1' },
                   flex: { lg: '1' }
                 }}
               >
                 <Box
                   sx={{
                     backgroundColor: 'white',
                     borderRadius: { xs: 2, md: 3 },
                     p: { xs: 2.5, md: 3.5 },
                                          boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                     transform: { xs: 'perspective(1000px) rotateY(8deg) rotateX(3deg)', lg: 'perspective(1000px) rotateY(5deg) rotateX(2deg)' },
                     transformOrigin: 'center center',
                     height: '100%',
                     display: 'flex',
                     flexDirection: 'column'
                   }}
                 >
                   {/* Header del editor optimizado */}
                   <Box sx={{ 
                     display: 'flex', 
                     alignItems: 'center', 
                     gap: 1.5, 
                     mb: { xs: 2, md: 2.5 }, 
                     pb: { xs: 1.5, md: 2 }, 
                     borderBottom: '1px solid #e1e5e9',
                     flexShrink: 0
                   }}>
                     <Box sx={{ 
                       width: { xs: 20, md: 24 }, 
                       height: { xs: 20, md: 24 }, 
                       borderRadius: '4px', 
                       backgroundColor: '#ff7043',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       color: 'white',
                       fontSize: { xs: '10px', md: '12px' },
                       fontWeight: 'bold'
                     }}>
                       📄
                     </Box>
                     <Typography variant="body2" sx={{ 
                       fontWeight: 600, 
                       fontSize: { xs: '0.8rem', md: '0.9rem' }, 
                       color: '#33475b'
                     }}>
                       Document Editor
                     </Typography>
                   </Box>

                   {/* Preview del documento optimizado */}
                   <Box sx={{ 
                     backgroundColor: '#f8f9fa', 
                     borderRadius: { xs: '4px', md: '6px' }, 
                     p: { xs: 1.5, md: 2 },
                     border: '1px solid #e1e5e9',
                     mb: { xs: 1.5, md: 2 },
                     flex: 1,
                     display: 'flex',
                     flexDirection: 'column',
                     gap: { xs: 0.8, md: 1 }
                   }}>
                     <Typography variant="body2" sx={{ 
                       fontSize: { xs: '0.7rem', md: '0.75rem' }, 
                       lineHeight: 1.4, 
                       color: '#33475b'
                     }}>
                       Dear <Box component="span" sx={{ 
                         backgroundColor: '#e3f2fd', 
                         color: '#1976d2',
                         px: { xs: 0.5, md: 0.6 }, 
                         py: 0.2,
                         borderRadius: '3px',
                         fontSize: { xs: '0.65rem', md: '0.7rem' },
                         fontWeight: 600
                       }}>
                         {'{contact.firstname}'}
                       </Box>,
                     </Typography>
                     
                     <Typography variant="body2" sx={{ 
                       fontSize: { xs: '0.7rem', md: '0.75rem' }, 
                       lineHeight: 1.4, 
                       color: '#666'
                     }}>
                       Proposal for <Box component="span" sx={{ 
                         backgroundColor: '#e8f5e9', 
                         color: '#2e7d32',
                         px: { xs: 0.5, md: 0.6 }, 
                         py: 0.2,
                         borderRadius: '3px',
                         fontSize: { xs: '0.65rem', md: '0.7rem' },
                         fontWeight: 600
                       }}>
                         {'{deal.amount}'}
                       </Box>
                     </Typography>

                     <Typography variant="body2" sx={{ 
                       fontSize: { xs: '0.7rem', md: '0.75rem' }, 
                       lineHeight: 1.4, 
                       color: '#666'
                     }}>
                       Company: <Box component="span" sx={{ 
                         backgroundColor: '#fff3e0', 
                         color: '#f57c00',
                         px: { xs: 0.5, md: 0.6 }, 
                         py: 0.2,
                         borderRadius: '3px',
                         fontSize: { xs: '0.65rem', md: '0.7rem' },
                         fontWeight: 600
                       }}>
                         {'{company.name}'}
                       </Box>
                </Typography>
              </Box>

                   {/* Propiedades disponibles optimizadas */}
                   <Box sx={{ flexShrink: 0 }}>
                     <Typography variant="caption" sx={{ 
                       color: '#7c98b6', 
                       fontSize: { xs: '0.6rem', md: '0.65rem' }, 
                       fontWeight: 600,
                       display: 'block',
                       mb: 0.8
                     }}>
                       Available Properties:
                     </Typography>
                     <Box sx={{ display: 'flex', gap: { xs: 0.5, md: 0.6 }, flexWrap: 'wrap' }}>
                       {[
                         { name: 'contact.email', color: '#1976d2' },
                         { name: 'deal.stage', color: '#2e7d32' },
                         { name: 'company.industry', color: '#f57c00' },
                         { name: 'deal.closedate', color: '#7b1fa2' }
                       ].map((prop, index) => (
                         <Box 
                           key={index}
                           sx={{ 
                             fontSize: { xs: '0.55rem', md: '0.6rem' },
                             backgroundColor: `${prop.color}15`,
                             color: prop.color,
                             px: { xs: 0.5, md: 0.6 },
                             py: { xs: 0.2, md: 0.3 },
                             borderRadius: '3px',
                             border: `1px solid ${prop.color}30`,
                             fontWeight: 500,
                             whiteSpace: 'nowrap'
                           }}
                         >
                           {prop.name}
                         </Box>
                       ))}
                     </Box>

                     {/* Estado del editor optimizado */}
                     <Box sx={{ 
                       display: 'flex', 
                       justifyContent: 'space-between',
                       alignItems: 'center',
                       mt: { xs: 1.5, md: 2 },
                       pt: { xs: 1.5, md: 2 },
                       borderTop: '1px solid #e1e5e9'
                     }}>
                       <Typography variant="caption" sx={{ 
                         color: '#7c98b6', 
                         fontSize: { xs: '0.6rem', md: '0.65rem' }
                       }}>
                         Auto-save: ON
                       </Typography>
                       <Typography variant="caption" sx={{ 
                         color: '#00bfa6', 
                         fontSize: { xs: '0.6rem', md: '0.65rem' },
                         fontWeight: 600
                       }}>
                         ✓ Ready to generate PDF
                       </Typography>
                     </Box>
                   </Box>
                 </Box>

                 {/* Badge optimizado */}
                 <Box
                   sx={{
                     position: 'absolute',
                     top: { xs: -8, md: -10 },
                     left: { xs: -8, md: -10 },
                     backgroundColor: '#00bfa6',
                     color: 'white',
                     borderRadius: { xs: 1.5, md: 2 },
                     px: { xs: 1, md: 1.5 },
                     py: { xs: 0.25, md: 0.5 },
                     fontSize: { xs: '0.6rem', md: '0.7rem' },
                     fontWeight: 600,
                     boxShadow: '0 3px 8px rgba(0,191,166,0.3)',
                     whiteSpace: 'nowrap'
                   }}
                 >
                   Document Editor
                 </Box>
               </Box>

                              {/* Elementos flotantes reorganizados para layout lado a lado */}
               
               {/* Feature flotante: Generación instantánea */}
               <Box
                 sx={{
                   position: 'absolute',
                   top: { xs: '15%', lg: '20%' },
                   right: { xs: '-5%', md: '-8%', lg: '-15%' },
                   backgroundColor: 'rgba(255,255,255,0.95)',
                   backdropFilter: 'blur(20px)',
                   borderRadius: { xs: 1.5, md: 2 },
                   p: { xs: 1.5, md: 2 },
                   display: { xs: 'none', md: 'flex' },
                   alignItems: 'center',
                   gap: 1,
                   boxShadow: '0 6px 24px rgba(0,0,0,0.1)',
                   border: '1px solid rgba(255,255,255,0.2)',
                   maxWidth: 140,
                   zIndex: 3
                 }}
               >
                 <Speed sx={{ color: '#4ade80', fontSize: '18px' }} />
                 <Typography variant="body2" sx={{ 
                   color: '#1f2937', 
                   fontWeight: 600, 
                   fontSize: '0.7rem',
                   lineHeight: 1.2
                 }}>
                   Generación instantánea
                 </Typography>
               </Box>

               {/* Feature flotante: Integración */}
               <Box
                 sx={{
                   position: 'absolute',
                   top: { xs: '45%', lg: '50%' },
                   left: { xs: '-5%', md: '-8%', lg: '-15%' },
                   backgroundColor: 'rgba(255,255,255,0.95)',
                   backdropFilter: 'blur(20px)',
                   borderRadius: { xs: 1.5, md: 2 },
                   p: { xs: 1.5, md: 2 },
                   display: { xs: 'none', md: 'flex' },
                   alignItems: 'center',
                   gap: 1,
                   boxShadow: '0 6px 24px rgba(0,0,0,0.1)',
                   border: '1px solid rgba(255,255,255,0.2)',
                   maxWidth: 140,
                   zIndex: 3
                 }}
               >
                 <ConnectWithoutContact sx={{ color: '#ff6b6b', fontSize: '18px' }} />
                 <Typography variant="body2" sx={{ 
                   color: '#1f2937', 
                   fontWeight: 600, 
                   fontSize: '0.7rem',
                   lineHeight: 1.2
                 }}>
                   Integración HubSpot
                 </Typography>
               </Box>

               {/* Feature flotante: Automatización */}
               <Box
                 sx={{
                   position: 'absolute',
                   bottom: { xs: '15%', lg: '20%' },
                   right: { xs: '-5%', md: '-8%', lg: '-15%' },
                   backgroundColor: 'rgba(255,255,255,0.95)',
                   backdropFilter: 'blur(20px)',
                   borderRadius: { xs: 1.5, md: 2 },
                   p: { xs: 1.5, md: 2 },
                   display: { xs: 'none', md: 'flex' },
                   alignItems: 'center',
                   gap: 1,
                   boxShadow: '0 6px 24px rgba(0,0,0,0.1)',
                   border: '1px solid rgba(255,255,255,0.2)',
                   maxWidth: 140,
                   zIndex: 3
                 }}
               >
                 <Security sx={{ color: '#8b5cf6', fontSize: '18px' }} />
                 <Typography variant="body2" sx={{ 
                   color: '#1f2937', 
                   fontWeight: 600, 
                   fontSize: '0.7rem',
                   lineHeight: 1.2
                 }}>
                   100% Automatizado
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
