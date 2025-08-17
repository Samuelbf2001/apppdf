import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Paper,
  Divider,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  Code,
  Visibility,
  Add,
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatSize,
  ColorLens,
  InsertLink,
  Image,
  TableChart,
  Save,
  Preview,
} from '@mui/icons-material';

import VariableSelector from '../HubSpot/VariableSelector';
import VariableChip from '../HubSpot/VariableChip';

/**
 * Editor avanzado de templates con constructor visual
 * Permite crear templates con variables de HubSpot de forma intuitiva
 */

interface TemplateVariable {
  name: string;
  label: string;
  type: 'contact.property' | 'deal.property' | 'company.property' | 'custom';
  required: boolean;
  defaultValue?: string;
}

interface AdvancedTemplateEditorProps {
  initialContent?: string;
  initialVariables?: TemplateVariable[];
  onSave?: (content: string, variables: TemplateVariable[]) => void;
  onPreview?: (content: string, variables: TemplateVariable[]) => void;
}

const AdvancedTemplateEditor: React.FC<AdvancedTemplateEditorProps> = ({
  initialContent = '',
  initialVariables = [],
  onSave,
  onPreview,
}) => {
  // Estados principales
  const [content, setContent] = useState(initialContent);
  const [variables, setVariables] = useState<TemplateVariable[]>(initialVariables);
  const [activeTab, setActiveTab] = useState(0); // 0: Editor, 1: Preview
  const [variableDialogOpen, setVariableDialogOpen] = useState(false);
  const [showVariablePanel, setShowVariablePanel] = useState(true);

  // Ref para el textarea
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Estados para el editor
  const [cursorPosition, setCursorPosition] = useState(0);
  const [selectedText, setSelectedText] = useState('');

  // Datos simulados de HubSpot (en producción vendrían de la API)
  const simulatedHubSpotProperties = {
    contacts: [
      { name: 'firstname', label: 'Nombre', type: 'string' },
      { name: 'lastname', label: 'Apellido', type: 'string' },
      { name: 'email', label: 'Email', type: 'string' },
      { name: 'phone', label: 'Teléfono', type: 'string' },
      { name: 'company', label: 'Empresa', type: 'string' },
      { name: 'jobtitle', label: 'Cargo', type: 'string' },
      { name: 'city', label: 'Ciudad', type: 'string' },
      { name: 'state', label: 'Estado/Provincia', type: 'string' },
      { name: 'country', label: 'País', type: 'string' },
      { name: 'website', label: 'Sitio Web', type: 'string' },
      { name: 'address', label: 'Dirección', type: 'string' },
      { name: 'zip', label: 'Código Postal', type: 'string' },
      { name: 'mobilephone', label: 'Teléfono Móvil', type: 'string' },
      { name: 'fax', label: 'Fax', type: 'string' },
      { name: 'date_of_birth', label: 'Fecha de Nacimiento', type: 'date' },
    ],
    deals: [
      { name: 'dealname', label: 'Nombre del Deal', type: 'string' },
      { name: 'amount', label: 'Valor', type: 'number' },
      { name: 'dealstage', label: 'Etapa del Deal', type: 'enumeration' },
      { name: 'pipeline', label: 'Pipeline', type: 'enumeration' },
      { name: 'closedate', label: 'Fecha de Cierre', type: 'date' },
      { name: 'createdate', label: 'Fecha de Creación', type: 'date' },
      { name: 'deal_currency_code', label: 'Moneda', type: 'enumeration' },
      { name: 'dealtype', label: 'Tipo de Deal', type: 'enumeration' },
      { name: 'deal_probability', label: 'Probabilidad', type: 'number' },
      { name: 'description', label: 'Descripción', type: 'string' },
      { name: 'amount_in_home_currency', label: 'Valor en Moneda Local', type: 'number' },
      { name: 'days_to_close', label: 'Días para Cerrar', type: 'number' },
    ],
    companies: [
      { name: 'name', label: 'Nombre de la Empresa', type: 'string' },
      { name: 'domain', label: 'Dominio', type: 'string' },
      { name: 'industry', label: 'Industria', type: 'enumeration' },
      { name: 'phone', label: 'Teléfono', type: 'string' },
      { name: 'city', label: 'Ciudad', type: 'string' },
      { name: 'state', label: 'Estado/Provincia', type: 'string' },
      { name: 'country', label: 'País', type: 'string' },
      { name: 'zip', label: 'Código Postal', type: 'string' },
      { name: 'address', label: 'Dirección', type: 'string' },
      { name: 'website', label: 'Sitio Web', type: 'string' },
      { name: 'description', label: 'Descripción', type: 'string' },
      { name: 'founded_year', label: 'Año de Fundación', type: 'string' },
      { name: 'employees', label: 'Número de Empleados', type: 'enumeration' },
      { name: 'annual_revenue', label: 'Ingresos Anuales', type: 'number' },
    ],
  };

  // Datos simulados para preview
  const simulatedData = {
    'contact.firstname': 'Juan',
    'contact.lastname': 'Pérez',
    'contact.email': 'juan.perez@example.com',
    'contact.phone': '+52 55 1234 5678',
    'contact.company': 'Innovaciones Tecnológicas S.A.',
    'contact.jobtitle': 'Director de Tecnología',
    'contact.city': 'Ciudad de México',
    'contact.country': 'México',
    'deal.dealname': 'Proyecto Digitalización 2024',
    'deal.amount': '150,000',
    'deal.deal_currency_code': 'MXN',
    'deal.closedate': '2024-03-15',
    'deal.dealstage': 'Propuesta Enviada',
    'deal.pipeline': 'Ventas Principal',
    'company.name': 'Innovaciones Tecnológicas S.A.',
    'company.domain': 'innovtech.mx',
    'company.industry': 'Tecnología',
    'company.phone': '+52 55 9876 5432',
    'company.city': 'Ciudad de México',
    'company.employees': '50-100',
    'current_date': new Date().toLocaleDateString('es-MX'),
    'current_year': new Date().getFullYear().toString(),
  };

  // Plantillas predefinidas para inicio rápido
  const templateSamples = {
    contract: `<h1>CONTRATO DE SERVICIOS</h1>

<p><strong>Fecha:</strong> {{current_date}}</p>

<h2>DATOS DEL CLIENTE</h2>
<p><strong>Nombre:</strong> {{contact.firstname}} {{contact.lastname}}</p>
<p><strong>Email:</strong> {{contact.email}}</p>
<p><strong>Teléfono:</strong> {{contact.phone}}</p>
<p><strong>Empresa:</strong> {{company.name}}</p>

<h2>DATOS DEL PROYECTO</h2>
<p><strong>Nombre del Proyecto:</strong> {{deal.dealname}}</p>
<p><strong>Valor del Contrato:</strong> ${{deal.amount}} {{deal.deal_currency_code}}</p>
<p><strong>Fecha de Cierre:</strong> {{deal.closedate}}</p>

<h2>TÉRMINOS Y CONDICIONES</h2>
<p>Este contrato establece los términos y condiciones para la prestación de servicios tecnológicos...</p>

<div style="margin-top: 50px;">
  <p>_______________________</p>
  <p>Firma del Cliente</p>
  <p>{{contact.firstname}} {{contact.lastname}}</p>
</div>`,

    proposal: `<div style="text-align: center; margin-bottom: 30px;">
  <h1>PROPUESTA COMERCIAL</h1>
  <p style="color: #666;">Propuesta para {{company.name}}</p>
</div>

<h2>Estimado(a) {{contact.firstname}},</h2>

<p>Gracias por su interés en nuestros servicios. A continuación presentamos nuestra propuesta:</p>

<h3>RESUMEN DEL PROYECTO</h3>
<p><strong>Proyecto:</strong> {{deal.dealname}}</p>
<p><strong>Empresa:</strong> {{company.name}}</p>
<p><strong>Industria:</strong> {{company.industry}}</p>

<h3>INVERSIÓN</h3>
<p><strong>Valor Total:</strong> ${{deal.amount}} {{deal.deal_currency_code}}</p>
<p><strong>Fecha estimada de cierre:</strong> {{deal.closedate}}</p>

<h3>CONTACTO</h3>
<p>Para cualquier consulta:</p>
<p><strong>Email:</strong> {{contact.email}}</p>
<p><strong>Teléfono:</strong> {{contact.phone}}</p>

<p style="margin-top: 40px;">Esperamos poder trabajar juntos.</p>
<p><strong>Atentamente,</strong><br>El equipo comercial</p>`,

    invoice: `<div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
  <div>
    <h1>FACTURA</h1>
    <p>Fecha: {{current_date}}</p>
  </div>
  <div style="text-align: right;">
    <p><strong>Tu Empresa S.A.</strong></p>
    <p>RFC: ABC123456789</p>
    <p>contacto@tuempresa.com</p>
  </div>
</div>

<h2>FACTURAR A:</h2>
<p><strong>{{company.name}}</strong></p>
<p>{{company.address}}</p>
<p>{{company.city}}, {{company.state}} {{company.zip}}</p>
<p>{{company.country}}</p>

<h2>CONTACTO:</h2>
<p>{{contact.firstname}} {{contact.lastname}}</p>
<p>{{contact.email}} | {{contact.phone}}</p>

<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
  <tr style="background: #f0f0f0;">
    <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Concepto</th>
    <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Importe</th>
  </tr>
  <tr>
    <td style="border: 1px solid #ddd; padding: 8px;">{{deal.dealname}}</td>
    <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${{deal.amount}} {{deal.deal_currency_code}}</td>
  </tr>
</table>

<p style="text-align: right; font-size: 18px; margin-top: 20px;">
  <strong>Total: ${{deal.amount}} {{deal.deal_currency_code}}</strong>
</p>`,
  };

  // Handlers
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const insertVariable = (variableName: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const variableText = `{{${variableName}}}`;
    const newContent = 
      content.substring(0, start) + 
      variableText + 
      content.substring(end);
    
    setContent(newContent);

    // Restaurar cursor
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + variableText.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const addVariable = (variable: {
    name: string;
    label: string;
    type: 'contact.property' | 'deal.property' | 'company.property';
  }) => {
    const newVariable: TemplateVariable = {
      name: variable.name,
      label: variable.label,
      type: variable.type,
      required: false,
    };

    // Verificar si ya existe
    if (!variables.find(v => v.name === variable.name)) {
      setVariables(prev => [...prev, newVariable]);
    }

    // Insertar en el contenido
    insertVariable(variable.name);
  };

  const removeVariable = (variableName: string) => {
    setVariables(prev => prev.filter(v => v.name !== variableName));
  };

  const insertTemplate = (templateKey: keyof typeof templateSamples) => {
    setContent(templateSamples[templateKey]);
    
    // Extraer variables del template
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const foundVariables: string[] = [];
    let match;

    while ((match = variableRegex.exec(templateSamples[templateKey])) !== null) {
      const variableName = match[1].trim();
      if (!foundVariables.includes(variableName)) {
        foundVariables.push(variableName);
      }
    }

    // Agregar variables encontradas
    const newVariables: TemplateVariable[] = [];
    foundVariables.forEach(varName => {
      if (!variables.find(v => v.name === varName)) {
        const [objectType, propertyName] = varName.split('.');
        newVariables.push({
          name: varName,
          label: getLabelForProperty(objectType, propertyName),
          type: objectType === 'current' ? 'custom' : `${objectType}.property` as any,
          required: false,
        });
      }
    });

    setVariables(prev => [...prev, ...newVariables]);
  };

  const getLabelForProperty = (objectType: string, propertyName: string): string => {
    const allProperties = {
      ...simulatedHubSpotProperties.contacts.reduce((acc, p) => ({ ...acc, [`contact.${p.name}`]: p.label }), {}),
      ...simulatedHubSpotProperties.deals.reduce((acc, p) => ({ ...acc, [`deal.${p.name}`]: p.label }), {}),
      ...simulatedHubSpotProperties.companies.reduce((acc, p) => ({ ...acc, [`company.${p.name}`]: p.label }), {}),
    };

    return allProperties[`${objectType}.${propertyName}`] || propertyName;
  };

  const formatText = (tag: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    if (!selectedText) return;

    let formattedText = '';
    
    switch (tag) {
      case 'bold':
        formattedText = `<strong>${selectedText}</strong>`;
        break;
      case 'italic':
        formattedText = `<em>${selectedText}</em>`;
        break;
      case 'underline':
        formattedText = `<u>${selectedText}</u>`;
        break;
      case 'h1':
        formattedText = `<h1>${selectedText}</h1>`;
        break;
      case 'h2':
        formattedText = `<h2>${selectedText}</h2>`;
        break;
      case 'h3':
        formattedText = `<h3>${selectedText}</h3>`;
        break;
    }

    const newContent = 
      content.substring(0, start) + 
      formattedText + 
      content.substring(end);
    
    setContent(newContent);
  };

  const insertTable = () => {
    const tableHtml = `
<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
  <tr style="background: #f0f0f0;">
    <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Concepto</th>
    <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Descripción</th>
    <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Valor</th>
  </tr>
  <tr>
    <td style="border: 1px solid #ddd; padding: 8px;">{{deal.dealname}}</td>
    <td style="border: 1px solid #ddd; padding: 8px;">Servicio profesional</td>
    <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${{deal.amount}} {{deal.deal_currency_code}}</td>
  </tr>
</table>`;

    insertAtCursor(tableHtml);
  };

  const insertAtCursor = (text: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const newContent = 
      content.substring(0, start) + 
      text + 
      content.substring(end);
    
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      const newPosition = start + text.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const processContentForPreview = (htmlContent: string): string => {
    let processedContent = htmlContent;

    // Reemplazar variables con datos simulados
    Object.entries(simulatedData).forEach(([variable, value]) => {
      const regex = new RegExp(`\\{\\{\\s*${variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\}\\}`, 'g');
      processedContent = processedContent.replace(regex, value.toString());
    });

    // Limpiar variables no encontradas
    processedContent = processedContent.replace(/\{\{[^}]*\}\}/g, 
      '<span style="background: #ffeb3b; padding: 2px 4px; border-radius: 2px; font-size: 11px;">[Variable no resuelta]</span>'
    );

    return processedContent;
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={600}>
            🏗️ Constructor de Templates PDF
          </Typography>
          
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowVariablePanel(!showVariablePanel)}
            >
              {showVariablePanel ? 'Ocultar' : 'Mostrar'} Variables
            </Button>
            
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={() => onSave?.(content, variables)}
              disabled={!content.trim()}
            >
              Guardar
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Contenido principal */}
      <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
        <Grid container sx={{ height: '100%' }}>
          {/* Panel de editor */}
          <Grid item xs={showVariablePanel ? 8 : 12} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Barra de herramientas */}
            <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                  Formato:
                </Typography>
                
                <Tooltip title="Negrita">
                  <IconButton size="small" onClick={() => formatText('bold')}>
                    <FormatBold />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Cursiva">
                  <IconButton size="small" onClick={() => formatText('italic')}>
                    <FormatItalic />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Subrayado">
                  <IconButton size="small" onClick={() => formatText('underline')}>
                    <FormatUnderlined />
                  </IconButton>
                </Tooltip>

                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

                <Tooltip title="Título H1">
                  <Button size="small" onClick={() => formatText('h1')}>H1</Button>
                </Tooltip>
                
                <Tooltip title="Título H2">
                  <Button size="small" onClick={() => formatText('h2')}>H2</Button>
                </Tooltip>
                
                <Tooltip title="Título H3">
                  <Button size="small" onClick={() => formatText('h3')}>H3</Button>
                </Tooltip>

                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

                <Tooltip title="Insertar Tabla">
                  <IconButton size="small" onClick={insertTable}>
                    <TableChart />
                  </IconButton>
                </Tooltip>

                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

                <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                  Templates:
                </Typography>
                
                <Button size="small" onClick={() => insertTemplate('contract')}>
                  📄 Contrato
                </Button>
                
                <Button size="small" onClick={() => insertTemplate('proposal')}>
                  📋 Propuesta
                </Button>
                
                <Button size="small" onClick={() => insertTemplate('invoice')}>
                  🧾 Factura
                </Button>
              </Stack>
            </Box>

            {/* Tabs de Editor/Preview */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab 
                  icon={<Code />} 
                  label="Editor HTML" 
                  iconPosition="start"
                />
                <Tab 
                  icon={<Visibility />} 
                  label="Vista Previa" 
                  iconPosition="start"
                />
              </Tabs>
            </Box>

            {/* Contenido del editor */}
            <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
              {activeTab === 0 ? (
                // Editor HTML
                <TextField
                  ref={textareaRef}
                  multiline
                  fullWidth
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={`Escribe tu template aquí...

Puedes usar:
• Variables: {{contact.firstname}}, {{deal.amount}}, {{company.name}}
• HTML básico: <h1>, <p>, <strong>, <table>, etc.
• O seleccionar un template predefinido arriba

Ejemplo:
<h1>Hola {{contact.firstname}}!</h1>
<p>Tu empresa {{company.name}} tiene un deal por ${{deal.amount}}.</p>`}
                  variant="outlined"
                  sx={{
                    height: '100%',
                    '& .MuiInputBase-root': {
                      height: '100%',
                      alignItems: 'flex-start',
                    },
                    '& .MuiInputBase-input': {
                      height: '100% !important',
                      overflow: 'auto !important',
                      fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                      fontSize: '14px',
                      lineHeight: 1.5,
                      resize: 'none',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                    },
                  }}
                />
              ) : (
                // Vista previa
                <Box sx={{ height: '100%', overflow: 'auto', p: 3 }}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Vista previa con datos simulados de HubSpot
                  </Alert>
                  
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 4, 
                      minHeight: 400,
                      bgcolor: 'white',
                      fontFamily: '"Helvetica Neue", Arial, sans-serif',
                      fontSize: '14px',
                      lineHeight: 1.6,
                    }}
                  >
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: processContentForPreview(content) || 
                          '<p style="color: #999; font-style: italic; text-align: center;">Escribe contenido en el editor para ver la vista previa...</p>'
                      }} 
                    />
                  </Paper>
                </Box>
              )}
            </Box>
          </Grid>

          {/* Panel de variables (lateral) */}
          {showVariablePanel && (
            <Grid item xs={4} sx={{ height: '100%', borderLeft: 1, borderColor: 'divider' }}>
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Header del panel */}
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="h6" fontWeight={600}>
                    🧩 Variables ({variables.length})
                  </Typography>
                </Box>

                {/* Variables activas */}
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Variables en uso:
                  </Typography>
                  
                  {variables.length > 0 ? (
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {variables.map((variable, index) => (
                        <VariableChip
                          key={index}
                          variableName={variable.name}
                          label={variable.label}
                          onDelete={() => removeVariable(variable.name)}
                          onClick={() => insertVariable(variable.name)}
                        />
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No hay variables aún. Agrégalas desde el selector abajo.
                    </Typography>
                  )}
                </Box>

                {/* Selector de variables de HubSpot */}
                <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Propiedades de HubSpot:
                  </Typography>
                  
                  <VariableSelector
                    onVariableSelect={addVariable}
                    selectedVariables={variables.map(v => v.name)}
                    showCommonOnly={true}
                  />
                </Box>

                {/* Acciones del panel */}
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Stack spacing={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      fullWidth
                      onClick={() => setVariableDialogOpen(true)}
                      startIcon={<Add />}
                    >
                      Variable Personalizada
                    </Button>
                    
                    <Button
                      variant="outlined"
                      size="small"
                      fullWidth
                      onClick={() => onPreview?.(content, variables)}
                      startIcon={<Preview />}
                      disabled={!content.trim()}
                    >
                      Vista Previa PDF
                    </Button>
                  </Stack>
                </Box>
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Dialog para variable personalizada */}
      <Dialog
        open={variableDialogOpen}
        onClose={() => setVariableDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Agregar Variable Personalizada</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Las variables personalizadas no se conectan automáticamente con HubSpot.
            Deberás proporcionar los valores manualmente al generar documentos.
          </Alert>
          
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nombre de la variable"
              placeholder="mi_variable_personalizada"
              fullWidth
              helperText="Solo letras, números y guiones bajos"
            />
            
            <TextField
              label="Etiqueta descriptiva"
              placeholder="Mi Variable Personalizada"
              fullWidth
            />
            
            <TextField
              label="Valor por defecto (opcional)"
              placeholder="Valor que aparecerá si no se proporciona otro"
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVariableDialogOpen(false)}>
            Cancelar
          </Button>
          <Button variant="contained">
            Agregar Variable
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdvancedTemplateEditor;
