import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Stack,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Paper,
  Card,
  CardContent,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Code,
  Visibility,
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  TableChart,
  Save,
  Download,
  Person,
  AttachMoney,
  Business,
  ExpandMore,
  PlayArrow,
} from '@mui/icons-material';

/**
 * Constructor de Templates DEMO - Completamente funcional sin backend
 * Muestra todas las funcionalidades con datos simulados
 */

const DemoTemplateBuilder: React.FC = () => {
  const [content, setContent] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [variables, setVariables] = useState<Set<string>>(new Set());
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Datos simulados de HubSpot
  const hubspotProperties = {
    contacts: [
      { name: 'firstname', label: 'Nombre' },
      { name: 'lastname', label: 'Apellido' },
      { name: 'email', label: 'Email' },
      { name: 'phone', label: 'Teléfono' },
      { name: 'company', label: 'Empresa' },
      { name: 'jobtitle', label: 'Cargo' },
      { name: 'city', label: 'Ciudad' },
      { name: 'country', label: 'País' },
      { name: 'website', label: 'Sitio Web' },
      { name: 'mobilephone', label: 'Teléfono Móvil' },
    ],
    deals: [
      { name: 'dealname', label: 'Nombre del Deal' },
      { name: 'amount', label: 'Valor' },
      { name: 'dealstage', label: 'Etapa' },
      { name: 'pipeline', label: 'Pipeline' },
      { name: 'closedate', label: 'Fecha de Cierre' },
      { name: 'deal_currency_code', label: 'Moneda' },
      { name: 'dealtype', label: 'Tipo de Deal' },
      { name: 'description', label: 'Descripción' },
    ],
    companies: [
      { name: 'name', label: 'Nombre de la Empresa' },
      { name: 'domain', label: 'Dominio' },
      { name: 'industry', label: 'Industria' },
      { name: 'phone', label: 'Teléfono' },
      { name: 'city', label: 'Ciudad' },
      { name: 'state', label: 'Estado' },
      { name: 'country', label: 'País' },
      { name: 'website', label: 'Sitio Web' },
    ],
  };

  // Datos para reemplazo en preview
  const simulatedData: Record<string, string> = {
    'contact.firstname': 'Juan',
    'contact.lastname': 'Pérez',
    'contact.email': 'juan.perez@innovtech.mx',
    'contact.phone': '+52 55 1234 5678',
    'contact.company': 'Innovaciones Tecnológicas S.A.',
    'contact.jobtitle': 'Director de Tecnología',
    'contact.city': 'Ciudad de México',
    'contact.country': 'México',
    'deal.dealname': 'Proyecto Digitalización 2024',
    'deal.amount': '150,000',
    'deal.deal_currency_code': 'MXN',
    'deal.closedate': '15 de Marzo, 2024',
    'deal.dealstage': 'Propuesta Enviada',
    'deal.pipeline': 'Ventas Principal',
    'company.name': 'Innovaciones Tecnológicas S.A.',
    'company.domain': 'innovtech.mx',
    'company.industry': 'Tecnología',
    'company.phone': '+52 55 9876 5432',
    'company.city': 'Ciudad de México',
    'current_date': new Date().toLocaleDateString('es-MX'),
    'current_year': new Date().getFullYear().toString(),
  };

  // Templates de ejemplo
  const sampleTemplates = {
    welcome: `<div style="text-align: center; padding: 40px; border: 2px dashed #ff6b35; border-radius: 8px; background: #fff8f5;">
  <h1 style="color: #ff6b35; margin-bottom: 16px;">🎉 ¡Bienvenido al Constructor Visual!</h1>
  
  <p style="margin-bottom: 20px; color: #666;">
    Este es el <strong>editor avanzado de templates</strong> con propiedades simuladas de HubSpot.
  </p>
  
  <h3 style="color: #007a8c; margin-bottom: 12px;">🚀 Para empezar:</h3>
  <div style="text-align: left; max-width: 400px; margin: 0 auto; background: white; padding: 20px; border-radius: 6px;">
    <p>1. 📄 <strong>Selecciona un template</strong> de los botones de arriba</p>
    <p>2. 🧩 <strong>Agrega variables</strong> del panel derecho</p>
    <p>3. ✏️ <strong>Personaliza el contenido</strong> con HTML</p>
    <p>4. 👁️ <strong>Ve la vista previa</strong> en tiempo real</p>
    <p>5. 💾 <strong>Guarda tu template</strong></p>
  </div>
  
  <div style="margin-top: 20px; padding: 12px; background: #e3f2fd; border-radius: 6px;">
    <small style="color: #1976d2;">
      💡 <strong>Tip:</strong> Haz clic en cualquier variable del panel derecho para insertarla aquí.
    </small>
  </div>
</div>`,

    contract: `<h1>CONTRATO DE SERVICIOS</h1>

<p><strong>Fecha:</strong> {{current_date}}</p>

<h2>DATOS DEL CLIENTE</h2>
<p><strong>Nombre:</strong> {{contact.firstname}} {{contact.lastname}}</p>
<p><strong>Email:</strong> {{contact.email}}</p>
<p><strong>Teléfono:</strong> {{contact.phone}}</p>
<p><strong>Empresa:</strong> {{company.name}}</p>
<p><strong>Cargo:</strong> {{contact.jobtitle}}</p>

<h2>DATOS DEL PROYECTO</h2>
<p><strong>Nombre del Proyecto:</strong> {{deal.dealname}}</p>
<p><strong>Valor del Contrato:</strong> ${{deal.amount}} {{deal.deal_currency_code}}</p>
<p><strong>Fecha de Cierre:</strong> {{deal.closedate}}</p>
<p><strong>Pipeline:</strong> {{deal.pipeline}}</p>

<h2>TÉRMINOS Y CONDICIONES</h2>
<p>Este contrato establece los términos y condiciones para la prestación de servicios entre <strong>{{company.name}}</strong> (el Cliente) y nuestra empresa (el Proveedor).</p>

<h3>ALCANCE DE SERVICIOS</h3>
<p>El proyecto <strong>"{{deal.dealname}}"</strong> incluye todos los servicios acordados previamente con un valor total de <strong>${{deal.amount}} {{deal.deal_currency_code}}</strong>.</p>

<h3>RESPONSABILIDADES</h3>
<p><strong>Del Cliente ({{contact.firstname}} {{contact.lastname}}):</strong></p>
<ul>
  <li>Proporcionar acceso a sistemas y información necesaria</li>
  <li>Designar un punto de contacto para el proyecto</li>
  <li>Revisar y aprobar entregables en tiempo y forma</li>
</ul>

<p><strong>Del Proveedor:</strong></p>
<ul>
  <li>Entregar servicios conforme a especificaciones</li>
  <li>Mantener confidencialidad de información</li>
  <li>Proporcionar soporte durante el período acordado</li>
</ul>

<div style="margin-top: 50px; page-break-inside: avoid;">
  <div style="display: flex; justify-content: space-between;">
    <div style="text-align: center;">
      <p>_______________________</p>
      <p><strong>Firma del Cliente</strong></p>
      <p>{{contact.firstname}} {{contact.lastname}}</p>
      <p>{{company.name}}</p>
      <p>Fecha: ________________</p>
    </div>
    
    <div style="text-align: center;">
      <p>_______________________</p>
      <p><strong>Firma del Proveedor</strong></p>
      <p>Representante Legal</p>
      <p>Tu Empresa S.A.</p>
      <p>Fecha: {{current_date}}</p>
    </div>
  </div>
</div>`,

    proposal: `<div style="text-align: center; margin-bottom: 30px;">
  <h1 style="color: #ff6b35;">PROPUESTA COMERCIAL</h1>
  <p style="color: #666; font-size: 18px;">Propuesta para {{company.name}}</p>
  <p style="color: #999; font-size: 14px;">{{current_date}}</p>
</div>

<h2>Estimado(a) {{contact.firstname}},</h2>

<p>Gracias por su interés en nuestros servicios. Hemos preparado esta propuesta personalizada para <strong>{{company.name}}</strong> considerando sus necesidades específicas en el sector de <em>{{company.industry}}</em>.</p>

<h3>📋 RESUMEN DEL PROYECTO</h3>
<table style="width: 100%; border-collapse: collapse; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
  <tr style="background: linear-gradient(135deg, #ff6b35, #007a8c); color: white;">
    <th style="border: 1px solid #ddd; padding: 15px; text-align: left;">Detalle</th>
    <th style="border: 1px solid #ddd; padding: 15px; text-align: left;">Información</th>
  </tr>
  <tr>
    <td style="border: 1px solid #ddd; padding: 12px; background: #f8f9fa;"><strong>Proyecto</strong></td>
    <td style="border: 1px solid #ddd; padding: 12px;">{{deal.dealname}}</td>
  </tr>
  <tr>
    <td style="border: 1px solid #ddd; padding: 12px; background: #f8f9fa;"><strong>Empresa</strong></td>
    <td style="border: 1px solid #ddd; padding: 12px;">{{company.name}}</td>
  </tr>
  <tr>
    <td style="border: 1px solid #ddd; padding: 12px; background: #f8f9fa;"><strong>Industria</strong></td>
    <td style="border: 1px solid #ddd; padding: 12px;">{{company.industry}}</td>
  </tr>
  <tr>
    <td style="border: 1px solid #ddd; padding: 12px; background: #f8f9fa;"><strong>Sitio Web</strong></td>
    <td style="border: 1px solid #ddd; padding: 12px;">{{company.website}}</td>
  </tr>
  <tr>
    <td style="border: 1px solid #ddd; padding: 12px; background: #f8f9fa;"><strong>Contacto Principal</strong></td>
    <td style="border: 1px solid #ddd; padding: 12px;">{{contact.firstname}} {{contact.lastname}} - {{contact.jobtitle}}</td>
  </tr>
</table>

<h3>💰 INVERSIÓN</h3>
<div style="background: linear-gradient(135deg, #e8f5e8, #c8e6c9); padding: 24px; border-radius: 8px; text-align: center; margin: 20px 0;">
  <p style="font-size: 24px; margin: 0; color: #2e7d32;">
    <strong>Valor Total: ${{deal.amount}} {{deal.deal_currency_code}}</strong>
  </p>
  <p style="margin: 8px 0 0 0; color: #388e3c;">Fecha estimada de cierre: {{deal.closedate}}</p>
</div>

<h3>📞 CONTACTO</h3>
<div style="background: #f8f9fa; padding: 16px; border-left: 4px solid #ff6b35; margin: 20px 0;">
  <p>Para cualquier consulta sobre esta propuesta:</p>
  <p><strong>📧 Email:</strong> {{contact.email}}</p>
  <p><strong>📱 Teléfono:</strong> {{contact.phone}}</p>
  <p><strong>🌐 Empresa:</strong> {{company.name}} ({{company.domain}})</p>
</div>

<h3>⏰ PRÓXIMOS PASOS</h3>
<ol style="line-height: 1.8;">
  <li>Revisión de esta propuesta por parte de {{contact.firstname}}</li>
  <li>Reunión de aclaración (si es necesario)</li>
  <li>Firma del contrato de servicios</li>
  <li>Inicio del proyecto: {{deal.dealname}}</li>
</ol>

<div style="margin-top: 50px; text-align: center; padding: 20px; background: #f0f8ff; border-radius: 8px;">
  <p style="font-size: 16px; margin-bottom: 10px;">
    <em>Esperamos poder colaborar con <strong>{{company.name}}</strong> en este proyecto.</em>
  </p>
  <p><strong>Atentamente,</strong></p>
  <p><strong>El Equipo Comercial</strong></p>
  <p style="color: #666;">{{current_date}}</p>
</div>`,

    invoice: `<div style="display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 3px solid #ff6b35; padding-bottom: 20px;">
  <div>
    <h1 style="color: #ff6b35; font-size: 36px; margin: 0;">FACTURA</h1>
    <p style="margin: 8px 0;"><strong>Fecha:</strong> {{current_date}}</p>
    <p style="margin: 8px 0;"><strong>Año Fiscal:</strong> {{current_year}}</p>
  </div>
  <div style="text-align: right; color: #666;">
    <p><strong style="font-size: 18px;">Tu Empresa S.A. de C.V.</strong></p>
    <p>RFC: ABC123456789</p>
    <p>📧 contacto@tuempresa.com</p>
    <p>📱 +52 55 0000 0000</p>
    <p>🌐 www.tuempresa.com</p>
  </div>
</div>

<h2 style="color: #007a8c;">🏢 FACTURAR A:</h2>
<div style="background: linear-gradient(135deg, #f8f9fa, #e3f2fd); padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #2196f3;">
  <p style="font-size: 18px; margin: 0 0 8px 0;"><strong>{{company.name}}</strong></p>
  <p style="margin: 4px 0; color: #666;">{{company.address}}</p>
  <p style="margin: 4px 0; color: #666;">{{company.city}}, {{company.state}}</p>
  <p style="margin: 4px 0; color: #666;">{{company.country}}</p>
  
  <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #ddd;">
    <p><strong>👤 Contacto:</strong> {{contact.firstname}} {{contact.lastname}} - {{contact.jobtitle}}</p>
    <p><strong>📧 Email:</strong> {{contact.email}}</p>
    <p><strong>📱 Teléfono:</strong> {{contact.phone}}</p>
  </div>
</div>

<h2 style="color: #007a8c;">💼 DETALLES DE FACTURACIÓN:</h2>
<table style="width: 100%; border-collapse: collapse; margin: 25px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden;">
  <thead>
    <tr style="background: linear-gradient(135deg, #ff6b35, #007a8c); color: white;">
      <th style="border: none; padding: 15px; text-align: left; font-size: 14px;">Concepto</th>
      <th style="border: none; padding: 15px; text-align: center; font-size: 14px;">Cant.</th>
      <th style="border: none; padding: 15px; text-align: right; font-size: 14px;">Importe</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background: white;">
      <td style="border-bottom: 1px solid #e0e0e0; padding: 15px;">
        <strong style="color: #333;">{{deal.dealname}}</strong><br>
        <small style="color: #666; font-style: italic;">Servicios profesionales especializados en {{company.industry}}</small><br>
        <small style="color: #999;">Pipeline: {{deal.pipeline}} | Etapa: {{deal.dealstage}}</small>
      </td>
      <td style="border-bottom: 1px solid #e0e0e0; padding: 15px; text-align: center; font-size: 16px;">1</td>
      <td style="border-bottom: 1px solid #e0e0e0; padding: 15px; text-align: right; font-size: 16px; font-weight: 600;">${{deal.amount}} {{deal.deal_currency_code}}</td>
    </tr>
    <tr style="background: #f8f9fa;">
      <td colspan="2" style="border: none; padding: 15px; text-align: right; font-size: 16px;"><strong>SUBTOTAL:</strong></td>
      <td style="border: none; padding: 15px; text-align: right; font-size: 16px; font-weight: 600;">${{deal.amount}} {{deal.deal_currency_code}}</td>
    </tr>
    <tr style="background: #fff;">
      <td colspan="2" style="border: none; padding: 15px; text-align: right; font-size: 16px;"><strong>IVA (16%):</strong></td>
      <td style="border: none; padding: 15px; text-align: right; font-size: 16px; font-weight: 600;">Incluido</td>
    </tr>
    <tr style="background: linear-gradient(135deg, #e8f5e8, #c8e6c9);">
      <td colspan="2" style="border: none; padding: 20px; text-align: right; font-size: 18px;"><strong>TOTAL:</strong></td>
      <td style="border: none; padding: 20px; text-align: right; font-size: 20px; font-weight: 700; color: #2e7d32;">${{deal.amount}} {{deal.deal_currency_code}}</td>
    </tr>
  </tbody>
</table>

<h2 style="color: #007a8c;">💳 INSTRUCCIONES DE PAGO</h2>
<div style="background: #e3f2fd; padding: 20px; border-radius: 8px; border-left: 4px solid #2196f3;">
  <p><strong>🏦 Método de Pago:</strong> Transferencia bancaria</p>
  <p><strong>💳 Cuenta:</strong> XXXX-XXXX-XXXX-XXXX (Banco XYZ)</p>
  <p><strong>🔖 Referencia:</strong> {{deal.dealname}} - {{company.name}}</p>
  <p><strong>📅 Fecha límite:</strong> 30 días naturales a partir de esta fecha</p>
  <p><strong>📧 Enviar comprobante a:</strong> facturacion@tuempresa.com</p>
</div>

<div style="margin-top: 40px; text-align: center; padding: 20px; background: #fff8f5; border-radius: 8px;">
  <p style="font-size: 16px; color: #ff6b35; margin: 0;">
    <strong>¡Gracias por elegir nuestros servicios, {{contact.firstname}}! 🎉</strong>
  </p>
  <p style="margin: 8px 0 0 0; color: #666;">Esperamos continuar colaborando con {{company.name}}</p>
</div>`,
  };

  // Efectos
  useEffect(() => {
    // Cargar template de bienvenida al inicio
    setContent(sampleTemplates.welcome);
    extractVariables(sampleTemplates.welcome);
  }, []);

  // Funciones
  const extractVariables = (text: string) => {
    const regex = /\{\{([^}]+)\}\}/g;
    const found = new Set<string>();
    let match;

    while ((match = regex.exec(text)) !== null) {
      found.add(match[1].trim());
    }

    setVariables(found);
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
    
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + variableText.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const loadTemplate = (templateKey: keyof typeof sampleTemplates) => {
    const template = sampleTemplates[templateKey];
    setContent(template);
    extractVariables(template);
  };

  const formatText = (format: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    if (!selectedText) {
      alert('Selecciona texto primero para aplicar formato');
      return;
    }

    let formatted = '';
    switch (format) {
      case 'bold':
        formatted = `<strong>${selectedText}</strong>`;
        break;
      case 'italic':
        formatted = `<em>${selectedText}</em>`;
        break;
      case 'underline':
        formatted = `<u>${selectedText}</u>`;
        break;
    }

    const newContent = 
      content.substring(0, start) + 
      formatted + 
      content.substring(end);
    
    setContent(newContent);
  };

  const insertTable = () => {
    const tableHtml = `
<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
  <tr style="background: #f0f0f0;">
    <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Concepto</th>
    <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Descripción</th>
    <th style="border: 1px solid #ddd; padding: 12px; text-align: right;">Valor</th>
  </tr>
  <tr>
    <td style="border: 1px solid #ddd; padding: 12px;">{{deal.dealname}}</td>
    <td style="border: 1px solid #ddd; padding: 12px;">Servicios profesionales</td>
    <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">${{deal.amount}} {{deal.deal_currency_code}}</td>
  </tr>
</table>`;

    insertAtCursor(tableHtml);
  };

  const insertAtCursor = (text: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const newContent = 
      content.substring(0, start) + 
      text + 
      content.substring(start);
    
    setContent(newContent);
    extractVariables(newContent);
  };

  const processPreview = (html: string): string => {
    let processed = html;

    // Reemplazar variables con datos simulados
    Object.entries(simulatedData).forEach(([variable, value]) => {
      const regex = new RegExp(`\\{\\{\\s*${variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\}\\}`, 'g');
      processed = processed.replace(regex, `<mark style="background: #fff3cd; padding: 1px 3px; border-radius: 2px;" title="Variable: ${variable}">${value}</mark>`);
    });

    return processed;
  };

  const saveTemplate = () => {
    const templateData = {
      name: 'Mi Template Demo',
      content,
      variables: Array.from(variables),
      createdAt: new Date().toISOString(),
    };

    // Descargar como JSON
    const blob = new Blob([JSON.stringify(templateData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template-demo.json';
    a.click();
    URL.revokeObjectURL(url);

    alert(`✅ Template guardado!\n\n📊 Contiene:\n• ${content.length} caracteres\n• ${variables.size} variables\n• ${(content.match(/\n/g) || []).length + 1} líneas`);
  };

  const downloadPreview = () => {
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Preview - Template PDF</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; margin: 40px; }
    h1, h2, h3 { color: #2c3e50; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; }
    th { background: #f2f2f2; }
  </style>
</head>
<body>${processPreview(content)}</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template-preview.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    extractVariables(content);
  }, [content]);

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 0 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" fontWeight={700} color="primary">
              🏗️ Constructor Visual de Templates
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Demo con propiedades simuladas de HubSpot
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={1}>
            <Button onClick={() => loadTemplate('welcome')} size="small">🎉 Inicio</Button>
            <Button onClick={() => loadTemplate('contract')} size="small">📄 Contrato</Button>
            <Button onClick={() => loadTemplate('proposal')} size="small">📋 Propuesta</Button>
            <Button onClick={() => loadTemplate('invoice')} size="small">🧾 Factura</Button>
          </Stack>
        </Stack>
      </Paper>

      <Box sx={{ flexGrow: 1, display: 'flex' }}>
        <Grid container sx={{ height: '100%' }}>
          {/* Editor principal */}
          <Grid item xs={8} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Toolbar */}
            <Paper sx={{ p: 1, borderRadius: 0 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="caption" color="text.secondary">Formato:</Typography>
                <Tooltip title="Negrita"><IconButton size="small" onClick={() => formatText('bold')}><FormatBold /></IconButton></Tooltip>
                <Tooltip title="Cursiva"><IconButton size="small" onClick={() => formatText('italic')}><FormatItalic /></IconButton></Tooltip>
                <Tooltip title="Subrayado"><IconButton size="small" onClick={() => formatText('underline')}><FormatUnderlined /></IconButton></Tooltip>
                
                <Divider orientation="vertical" flexItem />
                
                <Tooltip title="Tabla"><IconButton size="small" onClick={insertTable}><TableChart /></IconButton></Tooltip>
                
                <Divider orientation="vertical" flexItem />
                
                <Button startIcon={<Save />} onClick={saveTemplate} size="small" variant="contained">
                  Guardar
                </Button>
                <Button startIcon={<Download />} onClick={downloadPreview} size="small">
                  HTML
                </Button>
              </Stack>
            </Paper>

            {/* Tabs */}
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
              <Tab icon={<Code />} label="Editor" iconPosition="start" />
              <Tab icon={<Visibility />} label="Vista Previa" iconPosition="start" />
            </Tabs>

            {/* Contenido */}
            <Box sx={{ flexGrow: 1 }}>
              {activeTab === 0 ? (
                <TextField
                  ref={textareaRef}
                  multiline
                  fullWidth
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Escribe tu template aquí... o selecciona uno de ejemplo"
                  variant="outlined"
                  sx={{
                    height: '100%',
                    '& .MuiInputBase-root': { height: '100%' },
                    '& .MuiInputBase-input': {
                      height: '100% !important',
                      fontFamily: 'Monaco, monospace',
                      fontSize: '14px',
                    },
                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                  }}
                />
              ) : (
                <Box sx={{ height: '100%', overflow: 'auto', p: 3, bgcolor: 'grey.50' }}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <strong>Vista previa con datos simulados de HubSpot</strong><br/>
                    Las variables resaltadas muestran cómo se verían con datos reales.
                  </Alert>
                  
                  <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto', minHeight: 400 }}>
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: processPreview(content) || '<p style="color: #999; text-align: center; font-style: italic;">El contenido aparecerá aquí...</p>' 
                      }} 
                    />
                  </Paper>
                </Box>
              )}
            </Box>
          </Grid>

          {/* Panel de variables */}
          <Grid item xs={4} sx={{ height: '100%', borderLeft: 1, borderColor: 'divider' }}>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Header variables */}
              <Paper sx={{ p: 2, borderRadius: 0 }}>
                <Typography variant="h6" fontWeight={600}>
                  🧩 Variables ({variables.size})
                </Typography>
              </Paper>

              {/* Variables actuales */}
              <Paper sx={{ p: 2, borderRadius: 0, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" gutterBottom>En uso:</Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap">
                  {Array.from(variables).map((variable, i) => (
                    <Chip
                      key={i}
                      label={`{{${variable}}}`}
                      size="small"
                      onClick={() => insertVariable(variable)}
                      sx={{ fontFamily: 'monospace', fontSize: '11px', mb: 0.5 }}
                    />
                  ))}
                  {variables.size === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      Ninguna variable aún
                    </Typography>
                  )}
                </Stack>
              </Paper>

              {/* Propiedades por categoría */}
              <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Person color="primary" />
                      <Typography fontWeight={600}>Contactos</Typography>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 1 }}>
                    <Stack spacing={0.5}>
                      {hubspotProperties.contacts.map((prop) => (
                        <Button
                          key={prop.name}
                          variant="outlined"
                          size="small"
                          fullWidth
                          onClick={() => insertVariable(`contact.${prop.name}`)}
                          sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                        >
                          <Box textAlign="left" width="100%">
                            <Typography variant="body2">{prop.label}</Typography>
                            <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                              {'{{contact.' + prop.name + '}}'}
                            </Typography>
                          </Box>
                        </Button>
                      ))}
                    </Stack>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <AttachMoney color="success" />
                      <Typography fontWeight={600}>Deals</Typography>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 1 }}>
                    <Stack spacing={0.5}>
                      {hubspotProperties.deals.map((prop) => (
                        <Button
                          key={prop.name}
                          variant="outlined"
                          size="small"
                          fullWidth
                          onClick={() => insertVariable(`deal.${prop.name}`)}
                          sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                        >
                          <Box textAlign="left" width="100%">
                            <Typography variant="body2">{prop.label}</Typography>
                            <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                              {'{{deal.' + prop.name + '}}'}
                            </Typography>
                          </Box>
                        </Button>
                      ))}
                    </Stack>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Business color="secondary" />
                      <Typography fontWeight={600}>Empresas</Typography>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 1 }}>
                    <Stack spacing={0.5}>
                      {hubspotProperties.companies.map((prop) => (
                        <Button
                          key={prop.name}
                          variant="outlined"
                          size="small"
                          fullWidth
                          onClick={() => insertVariable(`company.${prop.name}`)}
                          sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                        >
                          <Box textAlign="left" width="100%">
                            <Typography variant="body2">{prop.label}</Typography>
                            <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                              {'{{company.' + prop.name + '}}'}
                            </Typography>
                          </Box>
                        </Button>
                      ))}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              </Box>

              {/* Status */}
              <Paper sx={{ p: 1, borderRadius: 0, bgcolor: 'grey.100' }}>
                <Typography variant="caption" color="text.secondary">
                  Caracteres: {content.length} | Variables: {variables.size} | Líneas: {(content.match(/\n/g) || []).length + 1}
                </Typography>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default DemoTemplateBuilder;
