import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSnackbar } from 'notistack';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Stack,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControlLabel,
  Switch,
  Alert,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Save,
  Preview,
  Add,
  Delete,
  ArrowBack,
  Code,
  Visibility,
} from '@mui/icons-material';

import { 
  templateService, 
  Template, 
  CreateTemplateData, 
  UpdateTemplateData, 
  TemplateVariable 
} from '../../services/templateService';
import LoadingScreen from '../../components/Common/LoadingScreen';

/**
 * Editor de templates - Crear y editar plantillas
 */
const TemplateEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  
  const isEditing = Boolean(id);

  // Estados del formulario
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    content: '',
    isActive: true,
  });

  const [variables, setVariables] = useState<TemplateVariable[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [variableDialog, setVariableDialog] = useState(false);
  const [newVariable, setNewVariable] = useState<TemplateVariable>({
    name: '',
    label: '',
    type: 'contact.property',
    required: false,
    defaultValue: '',
  });

  // Query para obtener template existente
  const { data: templateData, isLoading } = useQuery(
    ['template', id],
    () => templateService.getTemplate(id!),
    {
      enabled: isEditing,
      onSuccess: (data) => {
        const template = data.data;
        setFormData({
          name: template.name,
          description: template.description || '',
          content: template.content,
          isActive: template.isActive,
        });
        setVariables(template.variables);
      },
    }
  );

  // Mutation para crear/actualizar template
  const saveMutation = useMutation(
    (data: CreateTemplateData | UpdateTemplateData) => {
      if (isEditing) {
        return templateService.updateTemplate(id!, data);
      } else {
        return templateService.createTemplate(data as CreateTemplateData);
      }
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['templates']);
        enqueueSnackbar(
          isEditing ? 'Template actualizado exitosamente' : 'Template creado exitosamente',
          { variant: 'success' }
        );
        navigate('/templates');
      },
      onError: (error: any) => {
        enqueueSnackbar(error.message || 'Error guardando template', { variant: 'error' });
      },
    }
  );

  // Handlers
  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddVariable = () => {
    if (newVariable.name && newVariable.label) {
      setVariables(prev => [...prev, { ...newVariable }]);
      setNewVariable({
        name: '',
        label: '',
        type: 'contact.property',
        required: false,
        defaultValue: '',
      });
      setVariableDialog(false);
    }
  };

  const handleDeleteVariable = (index: number) => {
    setVariables(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      enqueueSnackbar('El nombre es requerido', { variant: 'error' });
      return;
    }

    if (!formData.content.trim()) {
      enqueueSnackbar('El contenido es requerido', { variant: 'error' });
      return;
    }

    const saveData = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      content: formData.content,
      variables,
      ...(isEditing && { isActive: formData.isActive }),
    };

    saveMutation.mutate(saveData);
  };

  const insertVariableInContent = (variableName: string) => {
    const textarea = document.getElementById('content-textarea') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentContent = formData.content;
      const newContent = 
        currentContent.substring(0, start) +
        `{{${variableName}}}` +
        currentContent.substring(end);
      
      handleFormChange('content', newContent);
      
      // Restaurar cursor después de la variable insertada
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variableName.length + 4, start + variableName.length + 4);
      }, 0);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Cargando template..." />;
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
          <IconButton onClick={() => navigate('/templates')}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1" fontWeight={600}>
            {isEditing ? 'Editar Template' : 'Crear Template'}
          </Typography>
        </Stack>

        {isEditing && templateData && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Editando: <strong>{templateData.data.name}</strong>
          </Alert>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Formulario principal */}
        <Grid item xs={12} lg={8}>
          <Stack spacing={3}>
            {/* Información básica */}
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Información Básica
                </Typography>
                
                <Stack spacing={3}>
                  <TextField
                    label="Nombre del Template *"
                    fullWidth
                    value={formData.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    placeholder="Ej: Contrato de Servicios"
                  />

                  <TextField
                    label="Descripción"
                    fullWidth
                    multiline
                    rows={2}
                    value={formData.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    placeholder="Breve descripción del template..."
                  />

                  {isEditing && (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.isActive}
                          onChange={(e) => handleFormChange('isActive', e.target.checked)}
                        />
                      }
                      label="Template Activo"
                    />
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Editor de contenido */}
            <Card>
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Typography variant="h6" fontWeight={600}>
                    Contenido del Template
                  </Typography>
                  
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Code />}
                      onClick={() => setShowPreview(false)}
                      color={!showPreview ? 'primary' : 'inherit'}
                    >
                      HTML
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Visibility />}
                      onClick={() => setShowPreview(true)}
                      color={showPreview ? 'primary' : 'inherit'}
                    >
                      Vista Previa
                    </Button>
                  </Stack>
                </Stack>

                {!showPreview ? (
                  <TextField
                    id="content-textarea"
                    fullWidth
                    multiline
                    rows={15}
                    value={formData.content}
                    onChange={(e) => handleFormChange('content', e.target.value)}
                    placeholder={`Escribe el contenido de tu template aquí...

Puedes usar variables de HubSpot como:
{{contact.firstname}} - Nombre del contacto
{{deal.amount}} - Valor del deal
{{company.name}} - Nombre de la empresa

El contenido soporta HTML básico para formato.`}
                    variant="outlined"
                    sx={{
                      '& .MuiInputBase-input': {
                        fontFamily: 'monospace',
                        fontSize: '14px',
                      },
                    }}
                  />
                ) : (
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 3,
                      minHeight: 300,
                      maxHeight: 500,
                      overflow: 'auto',
                    }}
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: formData.content || '<p style="color: #666; font-style: italic;">El contenido aparecerá aquí...</p>',
                      }}
                    />
                  </Paper>
                )}

                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Usa HTML básico para formato. Las variables se escriben como {'{{nombre.variable}}'}.
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Panel lateral */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* Acciones */}
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Acciones
                </Typography>
                
                <Stack spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Save />}
                    onClick={handleSave}
                    disabled={saveMutation.isLoading}
                    fullWidth
                  >
                    {saveMutation.isLoading 
                      ? 'Guardando...' 
                      : (isEditing ? 'Actualizar' : 'Crear Template')
                    }
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={() => navigate('/templates')}
                    fullWidth
                  >
                    Cancelar
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            {/* Variables */}
            <Card>
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Typography variant="h6" fontWeight={600}>
                    Variables ({variables.length})
                  </Typography>
                  
                  <Button
                    size="small"
                    startIcon={<Add />}
                    onClick={() => setVariableDialog(true)}
                  >
                    Agregar
                  </Button>
                </Stack>

                {variables.length > 0 ? (
                  <List dense>
                    {variables.map((variable, index) => (
                      <ListItem
                        key={index}
                        sx={{
                          px: 0,
                          py: 1,
                          borderBottom: index < variables.length - 1 ? '1px solid' : 'none',
                          borderColor: 'divider',
                        }}
                      >
                        <ListItemText
                          primary={
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Typography
                                variant="body2"
                                fontFamily="monospace"
                                sx={{
                                  bgcolor: 'grey.100',
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 1,
                                  cursor: 'pointer',
                                }}
                                onClick={() => insertVariableInContent(variable.name)}
                              >
                                {'{{' + variable.name + '}}'}
                              </Typography>
                              {variable.required && (
                                <Chip label="Req." color="error" size="small" />
                              )}
                            </Stack>
                          }
                          secondary={variable.label}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteVariable(index)}
                          >
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                    No hay variables definidas.
                    <br />
                    Haz clic en "Agregar" para crear una.
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* Ayuda */}
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Ayuda
                </Typography>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  <strong>Variables comunes de HubSpot:</strong>
                </Typography>

                <List dense>
                  <ListItem sx={{ py: 0.5, px: 0 }}>
                    <ListItemText
                      primary={<code>contact.firstname</code>}
                      secondary="Nombre del contacto"
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5, px: 0 }}>
                    <ListItemText
                      primary={<code>contact.email</code>}
                      secondary="Email del contacto"
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5, px: 0 }}>
                    <ListItemText
                      primary={<code>deal.amount</code>}
                      secondary="Valor del deal"
                    />
                  </ListItem>
                  <ListItem sx={{ py: 0.5, px: 0 }}>
                    <ListItemText
                      primary={<code>company.name</code>}
                      secondary="Nombre de empresa"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Dialog para agregar variable */}
      <Dialog
        open={variableDialog}
        onClose={() => setVariableDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Agregar Variable</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Nombre de la Variable *"
              fullWidth
              value={newVariable.name}
              onChange={(e) => setNewVariable(prev => ({ ...prev, name: e.target.value }))}
              placeholder="contact.firstname"
              helperText="Usa el formato: objeto.propiedad"
            />

            <TextField
              label="Etiqueta Descriptiva *"
              fullWidth
              value={newVariable.label}
              onChange={(e) => setNewVariable(prev => ({ ...prev, label: e.target.value }))}
              placeholder="Nombre del contacto"
            />

            <TextField
              select
              label="Tipo"
              fullWidth
              value={newVariable.type}
              onChange={(e) => setNewVariable(prev => ({ ...prev, type: e.target.value as any }))}
              SelectProps={{ native: true }}
            >
              <option value="contact.property">Propiedad de Contacto</option>
              <option value="deal.property">Propiedad de Deal</option>
              <option value="company.property">Propiedad de Empresa</option>
              <option value="custom">Personalizada</option>
            </TextField>

            <TextField
              label="Valor por Defecto"
              fullWidth
              value={newVariable.defaultValue}
              onChange={(e) => setNewVariable(prev => ({ ...prev, defaultValue: e.target.value }))}
              placeholder="(Opcional)"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={newVariable.required}
                  onChange={(e) => setNewVariable(prev => ({ ...prev, required: e.target.checked }))}
                />
              }
              label="Variable Requerida"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVariableDialog(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleAddVariable}
            variant="contained"
            disabled={!newVariable.name || !newVariable.label}
          >
            Agregar Variable
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TemplateEditorPage;
