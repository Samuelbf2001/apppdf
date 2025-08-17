import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Stack,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  Add,
  Description,
  ArticleOutlined,
  TrendingUp,
  Schedule,
  CheckCircle,
  Error,
  Visibility,
  Download,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

/**
 * Dashboard principal con resumen de actividad y accesos rápidos
 */
const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // Datos simulados - en una implementación real vendrían de APIs
  const stats = {
    totalTemplates: 8,
    totalDocuments: 142,
    documentsThisMonth: 48,
    successRate: 98.5,
  };

  const recentDocuments = [
    {
      id: '1',
      name: 'Contrato - Empresa ABC',
      template: 'Contrato de Servicios',
      status: 'completed',
      createdAt: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      name: 'Propuesta - Cliente XYZ',
      template: 'Propuesta Comercial',
      status: 'processing',
      createdAt: '2024-01-15T09:15:00Z',
    },
    {
      id: '3',
      name: 'Factura - Proyecto 2024',
      template: 'Factura Personalizada',
      status: 'completed',
      createdAt: '2024-01-14T16:45:00Z',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'processing':
        return 'Procesando';
      case 'failed':
        return 'Error';
      default:
        return 'Pendiente';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle color="success" />;
      case 'processing':
        return <Schedule color="warning" />;
      case 'failed':
        return <Error color="error" />;
      default:
        return <Schedule color="action" />;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Resumen de tu actividad y accesos rápidos
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Estadísticas */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        width: 56,
                        height: 56,
                      }}
                    >
                      <ArticleOutlined />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight={600}>
                        {stats.totalTemplates}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Templates Activos
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar
                      sx={{
                        bgcolor: 'secondary.main',
                        width: 56,
                        height: 56,
                      }}
                    >
                      <Description />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight={600}>
                        {stats.totalDocuments}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Documentos Totales
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar
                      sx={{
                        bgcolor: 'success.main',
                        width: 56,
                        height: 56,
                      }}
                    >
                      <TrendingUp />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight={600}>
                        {stats.documentsThisMonth}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Este Mes
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar
                      sx={{
                        bgcolor: 'warning.main',
                        width: 56,
                        height: 56,
                      }}
                    >
                      <CheckCircle />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight={600}>
                        {stats.successRate}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tasa de Éxito
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Acciones Rápidas */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Acciones Rápidas
              </Typography>
              
              <Stack spacing={2} mt={2}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Add />}
                  fullWidth
                  onClick={() => navigate('/templates/builder')}
                >
                  🏗️ Constructor Visual
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Description />}
                  fullWidth
                  onClick={() => navigate('/documents')}
                >
                  Ver Documentos
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<ArticleOutlined />}
                  fullWidth
                  onClick={() => navigate('/templates')}
                >
                  Gestionar Templates
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Documentos Recientes */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6" fontWeight={600}>
                  Documentos Recientes
                </Typography>
                <Button
                  size="small"
                  onClick={() => navigate('/documents')}
                >
                  Ver Todos
                </Button>
              </Stack>

              <List>
                {recentDocuments.map((doc, index) => (
                  <React.Fragment key={doc.id}>
                    <ListItem
                      secondaryAction={
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/documents/${doc.id}`)}
                          >
                            <Visibility />
                          </IconButton>
                          {doc.status === 'completed' && (
                            <IconButton size="small">
                              <Download />
                            </IconButton>
                          )}
                        </Stack>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'grey.100' }}>
                          {getStatusIcon(doc.status)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                            sx={{ mb: 0.5 }}
                          >
                            <Typography variant="body1" fontWeight={500}>
                              {doc.name}
                            </Typography>
                            <Chip
                              label={getStatusText(doc.status)}
                              size="small"
                              color={getStatusColor(doc.status) as any}
                            />
                          </Stack>
                        }
                        secondary={
                          <Stack spacing={0.5}>
                            <Typography variant="body2" color="text.secondary">
                              Template: {doc.template}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(doc.createdAt).toLocaleDateString('es-MX', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </Typography>
                          </Stack>
                        }
                      />
                    </ListItem>
                    {index < recentDocuments.length - 1 && <Box component="li" sx={{ px: 2 }}></Box>}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Widget de Ayuda */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
            }}
          >
            <Typography variant="h6" fontWeight={600} gutterBottom>
              ¿Necesitas Ayuda?
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
              Explora nuestras guías y documentación para sacar el máximo provecho del generador de PDFs.
            </Typography>
            <Button
              variant="contained"
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.3)',
                },
              }}
            >
              Ver Documentación
            </Button>
          </Paper>
        </Grid>

        {/* Widget de Estado del Sistema */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Estado del Sistema
              </Typography>
              
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">API Backend</Typography>
                  <Chip label="Operativo" color="success" size="small" />
                </Stack>
                
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Generador PDF</Typography>
                  <Chip label="Operativo" color="success" size="small" />
                </Stack>
                
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">HubSpot Integration</Typography>
                  <Chip label="Conectado" color="success" size="small" />
                </Stack>
                
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Cola de Procesamiento</Typography>
                  <Chip label="Operativa" color="success" size="small" />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
