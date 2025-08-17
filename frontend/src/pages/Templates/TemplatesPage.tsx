import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Alert,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Add,
  Search,
  MoreVert,
  Edit,
  Delete,
  FileCopy,
  Visibility,
  ArticleOutlined,
  FilterList,
} from '@mui/icons-material';

import { templateService, Template, TemplateFilters } from '../../services/templateService';
import LoadingScreen from '../../components/Common/LoadingScreen';

/**
 * Página principal de gestión de templates
 * Lista, filtra, crea, edita y elimina templates
 */
const TemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  // Estados locales
  const [filters, setFilters] = useState<TemplateFilters>({
    page: 1,
    limit: 12,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; template?: Template }>({
    open: false,
  });
  const [duplicateDialog, setDuplicateDialog] = useState<{ open: boolean; template?: Template }>({
    open: false,
  });
  const [duplicateName, setDuplicateName] = useState('');
  const [anchorEl, setAnchorEl] = useState<{ [key: string]: HTMLElement | null }>({});

  // Query para obtener templates
  const {
    data: templatesResponse,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['templates', filters],
    () => templateService.getTemplates(filters),
    {
      keepPreviousData: true,
      staleTime: 30000, // 30 segundos
    }
  );

  // Mutation para eliminar template
  const deleteMutation = useMutation(
    (id: string) => templateService.deleteTemplate(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['templates']);
        enqueueSnackbar('Template eliminado exitosamente', { variant: 'success' });
        setDeleteDialog({ open: false });
      },
      onError: (error: any) => {
        enqueueSnackbar(error.message || 'Error eliminando template', { variant: 'error' });
      },
    }
  );

  // Mutation para duplicar template
  const duplicateMutation = useMutation(
    ({ id, name }: { id: string; name: string }) => templateService.duplicateTemplate(id, name),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['templates']);
        enqueueSnackbar('Template duplicado exitosamente', { variant: 'success' });
        setDuplicateDialog({ open: false });
        setDuplicateName('');
        navigate(`/templates/${data.data.id}/edit`);
      },
      onError: (error: any) => {
        enqueueSnackbar(error.message || 'Error duplicando template', { variant: 'error' });
      },
    }
  );

  // Handlers
  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm.trim() || undefined,
      page: 1,
    }));
  };

  const handleActiveFilterChange = (checked: boolean) => {
    setShowActiveOnly(checked);
    setFilters(prev => ({
      ...prev,
      isActive: checked ? true : undefined,
      page: 1,
    }));
  };

  const handleMenuOpen = (templateId: string, event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(prev => ({ ...prev, [templateId]: event.currentTarget }));
  };

  const handleMenuClose = (templateId: string) => {
    setAnchorEl(prev => ({ ...prev, [templateId]: null }));
  };

  const handleDelete = (template: Template) => {
    setDeleteDialog({ open: true, template });
    handleMenuClose(template.id);
  };

  const handleDuplicate = (template: Template) => {
    setDuplicateName(`${template.name} (Copia)`);
    setDuplicateDialog({ open: true, template });
    handleMenuClose(template.id);
  };

  const confirmDelete = () => {
    if (deleteDialog.template) {
      deleteMutation.mutate(deleteDialog.template.id);
    }
  };

  const confirmDuplicate = () => {
    if (duplicateDialog.template && duplicateName.trim()) {
      duplicateMutation.mutate({
        id: duplicateDialog.template.id,
        name: duplicateName.trim(),
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  // Renderizar loading
  if (isLoading && !templatesResponse) {
    return <LoadingScreen message="Cargando templates..." />;
  }

  // Renderizar error
  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          Error cargando templates. Intenta de nuevo.
        </Alert>
        <Button variant="contained" onClick={() => refetch()}>
          Reintentar
        </Button>
      </Box>
    );
  }

  const templates = templatesResponse?.data || [];
  const pagination = templatesResponse?.pagination;

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
        >
          <Box>
            <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
              Templates
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gestiona tus plantillas de documentos PDF
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<Add />}
              size="large"
              onClick={() => navigate('/templates/builder')}
            >
              🏗️ Constructor Visual
            </Button>
            
            <Button
              variant="contained"
              startIcon={<Add />}
              size="large"
              onClick={() => navigate('/templates/new')}
            >
              Crear Template
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems="center"
          >
            <TextField
              placeholder="Buscar templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              sx={{ flexGrow: 1, minWidth: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      ×
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={showActiveOnly}
                  onChange={(e) => handleActiveFilterChange(e.target.checked)}
                />
              }
              label="Solo activos"
            />

            <Button
              variant="outlined"
              startIcon={<Search />}
              onClick={handleSearch}
            >
              Buscar
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Resultados */}
      {pagination && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Mostrando {templates.length} de {pagination.total} templates
        </Typography>
      )}

      {/* Grid de templates */}
      <Grid container spacing={3}>
        {templates.map((template) => (
          <Grid item xs={12} sm={6} md={4} key={template.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: 4,
                },
                transition: 'box-shadow 0.2s',
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  mb={2}
                >
                  <ArticleOutlined color="primary" />
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(template.id, e)}
                  >
                    <MoreVert />
                  </IconButton>
                </Stack>

                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {template.name}
                </Typography>

                {template.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {template.description}
                  </Typography>
                )}

                <Stack direction="row" spacing={1} mb={2}>
                  <Chip
                    label={template.isActive ? 'Activo' : 'Inactivo'}
                    color={template.isActive ? 'success' : 'default'}
                    size="small"
                  />
                  {template.isDefault && (
                    <Chip label="Por defecto" color="primary" size="small" />
                  )}
                </Stack>

                <Stack spacing={1}>
                  <Typography variant="caption" color="text.secondary">
                    Variables: {template.variables.length}
                  </Typography>
                  {template._count && (
                    <Typography variant="caption" color="text.secondary">
                      Documentos: {template._count.documents}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    Actualizado: {new Date(template.updatedAt).toLocaleDateString('es-MX')}
                  </Typography>
                </Stack>
              </CardContent>

              <CardActions>
                <Button
                  size="small"
                  startIcon={<Visibility />}
                  onClick={() => navigate(`/templates/${template.id}`)}
                >
                  Ver
                </Button>
                <Button
                  size="small"
                  startIcon={<Edit />}
                  onClick={() => navigate(`/templates/${template.id}/edit`)}
                >
                  Editar
                </Button>
              </CardActions>

              {/* Menú contextual */}
              <Menu
                anchorEl={anchorEl[template.id]}
                open={Boolean(anchorEl[template.id])}
                onClose={() => handleMenuClose(template.id)}
              >
                <MenuItem onClick={() => navigate(`/templates/${template.id}/edit`)}>
                  <ListItemIcon>
                    <Edit fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Editar</ListItemText>
                </MenuItem>
                
                <MenuItem onClick={() => handleDuplicate(template)}>
                  <ListItemIcon>
                    <FileCopy fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Duplicar</ListItemText>
                </MenuItem>
                
                <MenuItem 
                  onClick={() => handleDelete(template)}
                  sx={{ color: 'error.main' }}
                  disabled={template._count && template._count.documents > 0}
                >
                  <ListItemIcon>
                    <Delete fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText>Eliminar</ListItemText>
                </MenuItem>
              </Menu>
            </Card>
          </Grid>
        ))}

        {/* Estado vacío */}
        {templates.length === 0 && (
          <Grid item xs={12}>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              py={8}
            >
              <ArticleOutlined sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {filters.search ? 'No se encontraron templates' : 'No hay templates aún'}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                {filters.search 
                  ? 'Intenta con otros términos de búsqueda' 
                  : 'Crea tu primer template para empezar a generar documentos'}
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/templates/new')}
              >
                Crear Template
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Paginación */}
      {pagination && pagination.totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Stack direction="row" spacing={1}>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === pagination.page ? 'contained' : 'outlined'}
                size="small"
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Button>
            ))}
          </Stack>
        </Box>
      )}

      {/* Dialog de confirmación de eliminación */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false })}
      >
        <DialogTitle>¿Eliminar template?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Esta acción eliminará permanentemente el template "{deleteDialog.template?.name}".
            {deleteDialog.template?._count?.documents && deleteDialog.template._count.documents > 0 && (
              <Box mt={1}>
                <Alert severity="warning">
                  Este template tiene {deleteDialog.template._count.documents} documento(s) asociado(s).
                  No se puede eliminar.
                </Alert>
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false })}>
            Cancelar
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={
              deleteMutation.isLoading ||
              (deleteDialog.template?._count?.documents && deleteDialog.template._count.documents > 0)
            }
          >
            {deleteMutation.isLoading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de duplicación */}
      <Dialog
        open={duplicateDialog.open}
        onClose={() => setDuplicateDialog({ open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Duplicar Template</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Ingresa un nombre para la copia del template "{duplicateDialog.template?.name}".
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            label="Nombre del template"
            value={duplicateName}
            onChange={(e) => setDuplicateName(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDuplicateDialog({ open: false })}>
            Cancelar
          </Button>
          <Button
            onClick={confirmDuplicate}
            variant="contained"
            disabled={duplicateMutation.isLoading || !duplicateName.trim()}
          >
            {duplicateMutation.isLoading ? 'Duplicando...' : 'Duplicar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TemplatesPage;
