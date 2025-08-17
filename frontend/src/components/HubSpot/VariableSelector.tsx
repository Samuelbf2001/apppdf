import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Chip,
  Stack,
  Alert,
  Skeleton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
} from '@mui/material';
import {
  Search,
  Person,
  Business,
  AttachMoney,
  ExpandMore,
  Code,
} from '@mui/icons-material';
import { useQuery } from 'react-query';

import { hubspotService, HubSpotProperty } from '../../services/hubspotService';

/**
 * Selector de variables de HubSpot
 * Permite explorar y seleccionar propiedades de contacts, deals y companies
 */
interface VariableSelectorProps {
  onVariableSelect: (variable: {
    name: string;
    label: string;
    type: 'contact.property' | 'deal.property' | 'company.property';
    defaultValue?: string;
  }) => void;
  selectedVariables?: string[];
  showCommonOnly?: boolean;
}

const VariableSelector: React.FC<VariableSelectorProps> = ({
  onVariableSelect,
  selectedVariables = [],
  showCommonOnly = true,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState<string[]>(['contacts']);

  // Query para obtener propiedades si no se muestran solo las comunes
  const { data: allProperties, isLoading, error } = useQuery(
    ['hubspot-properties'],
    () => hubspotService.getAllProperties(),
    {
      enabled: !showCommonOnly,
      staleTime: 10 * 60 * 1000, // 10 minutos
    }
  );

  // Obtener propiedades comunes o de la API
  const properties = showCommonOnly ? hubspotService.getCommonProperties() : allProperties;

  const handleSectionToggle = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleVariableClick = (objectType: 'contact' | 'deal' | 'company', property: any) => {
    const variableName = `${objectType}.${property.name}`;
    
    onVariableSelect({
      name: variableName,
      label: property.label,
      type: `${objectType}.property` as any,
      defaultValue: property.defaultValue,
    });
  };

  const filterProperties = (props: any[]) => {
    if (!searchTerm.trim()) return props;
    
    return props.filter(prop =>
      prop.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prop.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getObjectIcon = (objectType: string) => {
    switch (objectType) {
      case 'contacts':
        return <Person color="primary" />;
      case 'deals':
        return <AttachMoney color="success" />;
      case 'companies':
        return <Business color="secondary" />;
      default:
        return <Code color="action" />;
    }
  };

  const getObjectColor = (objectType: string) => {
    switch (objectType) {
      case 'contacts':
        return 'primary';
      case 'deals':
        return 'success';
      case 'companies':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const renderPropertyList = (objectType: 'contacts' | 'deals' | 'companies', props: any[]) => {
    const filteredProps = filterProperties(props);
    const singularObjectType = objectType.slice(0, -1) as 'contact' | 'deal' | 'company';

    if (filteredProps.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
          {searchTerm ? 'No se encontraron propiedades' : 'No hay propiedades disponibles'}
        </Typography>
      );
    }

    return (
      <List dense>
        {filteredProps.map((property) => {
          const variableName = `${singularObjectType}.${property.name}`;
          const isSelected = selectedVariables.includes(variableName);

          return (
            <ListItem key={property.name} disablePadding>
              <ListItemButton
                onClick={() => handleVariableClick(singularObjectType, property)}
                selected={isSelected}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                }}
              >
                <ListItemIcon>
                  <Chip
                    label={singularObjectType.charAt(0).toUpperCase()}
                    size="small"
                    color={getObjectColor(objectType) as any}
                  />
                </ListItemIcon>
                
                <ListItemText
                  primary={property.label}
                  secondary={
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: 'monospace',
                          bgcolor: 'grey.100',
                          px: 1,
                          py: 0.25,
                          borderRadius: 0.5,
                        }}
                      >
                        {`{{${variableName}}}`}
                      </Typography>
                      
                      {property.type && (
                        <Chip
                          label={property.type}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.65rem', height: 18 }}
                        />
                      )}
                    </Stack>
                  }
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    );
  };

  if (!showCommonOnly && isLoading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={40} sx={{ mb: 2 }} />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rectangular" height={200} sx={{ mb: 1 }} />
        ))}
      </Box>
    );
  }

  if (!showCommonOnly && error) {
    return (
      <Alert severity="error">
        Error cargando propiedades de HubSpot. Verifica tu conexión.
      </Alert>
    );
  }

  if (!properties) return null;

  return (
    <Box>
      {/* Buscador */}
      <TextField
        placeholder="Buscar propiedades..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        fullWidth
        size="small"
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />

      {/* Secciones de propiedades */}
      <Stack spacing={1}>
        {/* Contactos */}
        <Accordion
          expanded={expandedSections.includes('contacts')}
          onChange={() => handleSectionToggle('contacts')}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Stack direction="row" alignItems="center" spacing={1}>
              {getObjectIcon('contacts')}
              <Typography variant="subtitle1" fontWeight={600}>
                Contactos
              </Typography>
              <Chip 
                label={filterProperties(properties.contacts).length} 
                size="small" 
                color="primary"
              />
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ py: 1 }}>
            {renderPropertyList('contacts', properties.contacts)}
          </AccordionDetails>
        </Accordion>

        {/* Deals */}
        <Accordion
          expanded={expandedSections.includes('deals')}
          onChange={() => handleSectionToggle('deals')}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Stack direction="row" alignItems="center" spacing={1}>
              {getObjectIcon('deals')}
              <Typography variant="subtitle1" fontWeight={600}>
                Deals
              </Typography>
              <Chip 
                label={filterProperties(properties.deals).length} 
                size="small" 
                color="success"
              />
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ py: 1 }}>
            {renderPropertyList('deals', properties.deals)}
          </AccordionDetails>
        </Accordion>

        {/* Companies */}
        <Accordion
          expanded={expandedSections.includes('companies')}
          onChange={() => handleSectionToggle('companies')}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Stack direction="row" alignItems="center" spacing={1}>
              {getObjectIcon('companies')}
              <Typography variant="subtitle1" fontWeight={600}>
                Empresas
              </Typography>
              <Chip 
                label={filterProperties(properties.companies).length} 
                size="small" 
                color="secondary"
              />
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ py: 1 }}>
            {renderPropertyList('companies', properties.companies)}
          </AccordionDetails>
        </Accordion>
      </Stack>

      {/* Información adicional */}
      {!showCommonOnly && (
        <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: 'grey.50' }}>
          <Typography variant="caption" color="text.secondary">
            💡 <strong>Tip:</strong> Haz clic en cualquier propiedad para agregarla como variable.
            Las variables se insertarán automáticamente en tu template con el formato correcto.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default VariableSelector;
