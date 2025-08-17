import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Preview,
  Download,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

import AdvancedTemplateEditor from '../../components/TemplateEditor/AdvancedTemplateEditor';

/**
 * Página del constructor de templates
 * Versión completa del editor con todas las funcionalidades
 */
const TemplateBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [currentContent, setCurrentContent] = useState('');
  const [currentVariables, setCurrentVariables] = useState<any[]>([]);

  const handleSave = (content: string, variables: any[]) => {
    setCurrentContent(content);
    setCurrentVariables(variables);
    setSaveDialogOpen(true);
  };

  const handlePreview = (content: string, variables: any[]) => {
    setCurrentContent(content);
    setCurrentVariables(variables);
    setPreviewDialogOpen(true);
  };

  const confirmSave = () => {
    if (!templateName.trim()) {
      enqueueSnackbar('El nombre del template es requerido', { variant: 'error' });
      return;
    }

    if (!currentContent.trim()) {
      enqueueSnackbar('El contenido del template es requerido', { variant: 'error' });
      return;
    }

    // Simular guardado (en una implementación real llamaría a la API)
    const templateData = {
      name: templateName.trim(),
      description: templateDescription.trim(),
      content: currentContent,
      variables: currentVariables,
    };

    console.log('💾 Guardando template:', templateData);
    
    enqueueSnackbar('Template guardado exitosamente (simulado)', { variant: 'success' });
    setSaveDialogOpen(false);
    
    // En una implementación real, redirigir a la lista
    // navigate('/templates');
  };

  const downloadPreview = () => {
    // Simular descarga de preview
    const blob = new Blob([currentContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${templateName || 'template'}_preview.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    enqueueSnackbar('Preview descargado como HTML', { variant: 'info' });
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header de página */}
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/templates')}
            variant="outlined"
            size="small"
          >
            Volver
          </Button>
          
          <Box>
            <Typography variant="h4" fontWeight={600}>
              Constructor de Templates
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Crea templates profesionales con variables dinámicas de HubSpot
            </Typography>
          </Box>
        </Stack>

        {/* Información importante */}
        <Alert severity="info" sx={{ mt: 2 }}>
          <strong>🧪 Modo Desarrollo:</strong> Usando propiedades simuladas de HubSpot. 
          En producción se conectará automáticamente con las propiedades reales de tu cuenta.
        </Alert>
      </Box>

      {/* Editor principal */}
      <Box sx={{ flexGrow: 1 }}>
        <AdvancedTemplateEditor
          onSave={handleSave}
          onPreview={handlePreview}
        />
      </Box>

      {/* Dialog de guardado */}
      <Dialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>💾 Guardar Template</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Nombre del Template *"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              fullWidth
              placeholder="Ej: Contrato de Servicios"
            />

            <TextField
              label="Descripción"
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
              placeholder="Breve descripción del template..."
            />

            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  📊 Resumen del Template:
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    • <strong>Variables:</strong> {currentVariables.length}
                  </Typography>
                  <Typography variant="body2">
                    • <strong>Contenido:</strong> {currentContent.length} caracteres
                  </Typography>
                  <Typography variant="body2">
                    • <strong>Variables HubSpot:</strong> {currentVariables.filter(v => v.type !== 'custom').length}
                  </Typography>
                  <Typography variant="body2">
                    • <strong>Variables personalizadas:</strong> {currentVariables.filter(v => v.type === 'custom').length}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={confirmSave}
            variant="contained"
            disabled={!templateName.trim() || !currentContent.trim()}
          >
            Guardar Template
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de preview */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { height: '80vh' },
        }}
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            👁️ Vista Previa del Template
            <Button
              startIcon={<Download />}
              onClick={downloadPreview}
              size="small"
            >
              Descargar HTML
            </Button>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Alert severity="info" sx={{ m: 2, mb: 0 }}>
            Vista previa con datos simulados. En la versión real se usarán datos reales de HubSpot.
          </Alert>
          
          <Box 
            sx={{ 
              p: 4, 
              m: 2,
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              bgcolor: 'white',
              overflow: 'auto',
              maxHeight: 'calc(80vh - 200px)',
              fontFamily: '"Helvetica Neue", Arial, sans-serif',
              fontSize: '14px',
              lineHeight: 1.6,
            }}
          >
            <div dangerouslySetInnerHTML={{ 
              __html: currentContent || '<p style="color: #999; text-align: center;">No hay contenido para mostrar</p>'
            }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TemplateBuilderPage;
