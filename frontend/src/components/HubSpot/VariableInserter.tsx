import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Stack,
  Typography,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add,
  Close,
  Hub,
} from '@mui/icons-material';

import VariableSelector from './VariableSelector';
import { TemplateVariable } from '../../services/templateService';

/**
 * Componente para insertar variables de HubSpot en templates
 */
interface VariableInserterProps {
  onVariableAdd: (variable: TemplateVariable) => void;
  existingVariables: TemplateVariable[];
  onVariableInsert?: (variableName: string) => void;
}

const VariableInserter: React.FC<VariableInserterProps> = ({
  onVariableAdd,
  existingVariables,
  onVariableInsert,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showAllProperties, setShowAllProperties] = useState(false);

  const existingVariableNames = existingVariables.map(v => v.name);

  const handleVariableSelect = (variable: {
    name: string;
    label: string;
    type: 'contact.property' | 'deal.property' | 'company.property';
    defaultValue?: string;
  }) => {
    // Verificar si la variable ya existe
    if (existingVariableNames.includes(variable.name)) {
      // Si ya existe, solo insertarla en el contenido
      if (onVariableInsert) {
        onVariableInsert(variable.name);
        setDialogOpen(false);
      }
      return;
    }

    // Agregar nueva variable
    const newVariable: TemplateVariable = {
      name: variable.name,
      label: variable.label,
      type: variable.type,
      required: false,
      defaultValue: variable.defaultValue,
    };

    onVariableAdd(newVariable);

    // También insertarla en el contenido si es posible
    if (onVariableInsert) {
      onVariableInsert(variable.name);
    }

    setDialogOpen(false);
  };

  return (
    <>
      <Button
        startIcon={<Hub />}
        onClick={() => setDialogOpen(true)}
        variant="outlined"
        size="small"
      >
        Variables HubSpot
      </Button>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { height: '80vh', maxHeight: 800 },
        }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={2}>
              <Hub color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Variables de HubSpot
              </Typography>
            </Stack>
            
            <IconButton onClick={() => setDialogOpen(false)}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ pb: 1 }}>
          <Stack spacing={2} sx={{ height: '100%' }}>
            {/* Información y controles */}
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Selecciona una propiedad de HubSpot para agregarla como variable a tu template.
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={showAllProperties}
                    onChange={(e) => setShowAllProperties(e.target.checked)}
                    size="small"
                  />
                }
                label="Mostrar todas las propiedades"
                sx={{ mb: 1 }}
              />
            </Box>

            {/* Selector de variables */}
            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
              <VariableSelector
                onVariableSelect={handleVariableSelect}
                selectedVariables={existingVariableNames}
                showCommonOnly={!showAllProperties}
              />
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ flexGrow: 1 }}>
            {existingVariables.length} variable(s) en el template
          </Typography>
          
          <Button onClick={() => setDialogOpen(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default VariableInserter;
