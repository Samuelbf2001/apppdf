import React, { useEffect, useState } from 'react';
import {
  Divider,
  Text,
  Button,
  Flex,
  hubspot,
  Alert,
  Heading,
  LoadingSpinner,
  Tag,
  EmptyState,
  DescriptionList,
  DescriptionListItem,
} from '@hubspot/ui-extensions';

// Configuración de la extensión
hubspot.extend(({ context, runServerlessFunction, actions }) => (
  <PDFGeneratorCard
    context={context}
    runServerless={runServerlessFunction}
    onCrmPropertiesUpdate={actions.addAlert}
  />
));

/**
 * Componente principal de la CRM Card para el Generador de PDFs
 */
const PDFGeneratorCard = ({ context, runServerless, onCrmPropertiesUpdate }) => {
  // Estados del componente
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [error, setError] = useState(null);

  // Información del objeto actual (contacto, deal o empresa)
  const { hs_object_id: objectId, hs_object_source_id: objectType } = context.crm;
  const objectData = context.crm.objectProperties || {};

  /**
   * Cargar datos iniciales
   */
  useEffect(() => {
    loadInitialData();
  }, [objectId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar templates disponibles y documentos recientes
      const [templatesData, documentsData] = await Promise.all([
        fetchTemplates(),
        fetchRecentDocuments()
      ]);

      setTemplates(templatesData || []);
      setRecentDocuments(documentsData || []);
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error cargando datos. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtener templates disponibles
   */
  const fetchTemplates = async () => {
    try {
      const response = await fetch('https://automaticpdfhub.cloud/api/templates/list', {
        headers: {
          'Authorization': `Bearer ${context.secrets.ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Error fetching templates');
      const data = await response.json();
      return data.templates || [];
    } catch (error) {
      console.error('Error fetching templates:', error);
      return [];
    }
  };

  /**
   * Obtener documentos recientes para este objeto
   */
  const fetchRecentDocuments = async () => {
    try {
      const response = await fetch(`https://automaticpdfhub.cloud/api/documents/recent?objectId=${objectId}&objectType=${objectType}`, {
        headers: {
          'Authorization': `Bearer ${context.secrets.ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Error fetching documents');
      const data = await response.json();
      return data.documents || [];
    } catch (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
  };

  /**
   * Generar PDF con template seleccionado
   */
  const generatePDF = async (templateId) => {
    try {
      setLoading(true);
      setError(null);

      const payload = {
        templateId,
        objectId,
        objectType,
        objectData,
        generatePDF: true,
        uploadToHubSpot: true
      };

      const response = await fetch('https://automaticpdfhub.cloud/api/documents/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${context.secrets.ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Error generando PDF');
      
      const result = await response.json();

      // Mostrar mensaje de éxito
      onCrmPropertiesUpdate({
        type: 'success',
        message: `PDF "${result.document.name}" generado exitosamente. Se subirá automáticamente a HubSpot.`
      });

      // Recargar documentos recientes
      await loadInitialData();

    } catch (error) {
      console.error('Error generando PDF:', error);
      setError('Error generando PDF. Verifica tu conexión.');
      
      onCrmPropertiesUpdate({
        type: 'error',
        message: 'Error generando PDF. Inténtalo de nuevo.'
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Abrir constructor de templates
   */
  const openTemplateBuilder = () => {
    window.open('https://automaticpdfhub.cloud/templates/builder', '_blank');
  };

  /**
   * Ver documento generado
   */
  const viewDocument = (documentId) => {
    window.open(`https://automaticpdfhub.cloud/documents/${documentId}`, '_blank');
  };

  // Estado de carga
  if (loading && templates.length === 0) {
    return (
      <Flex direction="column" align="center" gap="medium">
        <LoadingSpinner size="md" />
        <Text>Cargando generador de PDFs...</Text>
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap="medium">
      {/* Header */}
      <Flex justify="between" align="center">
        <Heading>🚀 Generador de PDFs</Heading>
        <Button
          size="sm"
          variant="secondary"
          onClick={openTemplateBuilder}
        >
          🏗️ Constructor
        </Button>
      </Flex>

      {/* Error */}
      {error && (
        <Alert variant="error" title="Error">
          {error}
        </Alert>
      )}

      {/* Información del objeto */}
      <Flex direction="column" gap="sm">
        <Text variant="microcopy">
          <strong>Objeto actual:</strong> {objectType} #{objectId}
        </Text>
        
        {objectType === 'contacts' && objectData.firstname && (
          <Text variant="microcopy">
            👤 {objectData.firstname} {objectData.lastname} ({objectData.email})
          </Text>
        )}
        
        {objectType === 'deals' && objectData.dealname && (
          <Text variant="microcopy">
            💰 {objectData.dealname} - ${objectData.amount} {objectData.deal_currency_code}
          </Text>
        )}
        
        {objectType === 'companies' && objectData.name && (
          <Text variant="microcopy">
            🏢 {objectData.name} ({objectData.domain})
          </Text>
        )}
      </Flex>

      <Divider />

      {/* Templates disponibles */}
      <Flex direction="column" gap="sm">
        <Heading size="sm">📄 Generar PDF</Heading>
        
        {templates.length === 0 ? (
          <EmptyState
            title="Sin templates"
            subTitle="Crea tu primer template usando el constructor visual."
            actionButton={
              <Button onClick={openTemplateBuilder}>
                🏗️ Crear Template
              </Button>
            }
          />
        ) : (
          <Flex direction="column" gap="xs">
            {templates.slice(0, 3).map((template) => (
              <Flex key={template.id} justify="between" align="center">
                <Flex direction="column" gap="xs">
                  <Text variant="microcopy">
                    <strong>{template.name}</strong>
                  </Text>
                  <Text variant="microcopy">
                    {template.description || 'Sin descripción'}
                  </Text>
                </Flex>
                
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => generatePDF(template.id)}
                  disabled={loading}
                >
                  {loading ? '⏳' : '📄'} Generar
                </Button>
              </Flex>
            ))}
            
            {templates.length > 3 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.open('https://automaticpdfhub.cloud/templates', '_blank')}
              >
                Ver todos los templates ({templates.length})
              </Button>
            )}
          </Flex>
        )}
      </Flex>

      <Divider />

      {/* Documentos recientes */}
      <Flex direction="column" gap="sm">
        <Heading size="sm">📋 Documentos Recientes</Heading>
        
        {recentDocuments.length === 0 ? (
          <Text variant="microcopy">
            No hay documentos generados para este objeto.
          </Text>
        ) : (
          <Flex direction="column" gap="xs">
            {recentDocuments.slice(0, 3).map((doc) => (
              <Flex key={doc.id} justify="between" align="center">
                <Flex direction="column" gap="xs">
                  <Text variant="microcopy">
                    <strong>{doc.name}</strong>
                  </Text>
                  <Flex gap="xs" align="center">
                    <Tag 
                      variant={doc.status === 'completed' ? 'success' : 
                              doc.status === 'processing' ? 'warning' : 'error'}
                    >
                      {doc.status === 'completed' ? '✅ Completado' :
                       doc.status === 'processing' ? '⏳ Procesando' : '❌ Error'}
                    </Tag>
                    <Text variant="microcopy">
                      {new Date(doc.createdAt).toLocaleDateString('es-MX')}
                    </Text>
                  </Flex>
                </Flex>
                
                {doc.status === 'completed' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => viewDocument(doc.id)}
                  >
                    👁️ Ver
                  </Button>
                )}
              </Flex>
            ))}
            
            {recentDocuments.length > 3 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.open(`https://automaticpdfhub.cloud/documents?objectId=${objectId}`, '_blank')}
              >
                Ver todos los documentos ({recentDocuments.length})
              </Button>
            )}
          </Flex>
        )}
      </Flex>

      {/* Footer con información */}
      <Divider />
      <Text variant="microcopy" align="center">
        🤖 AutomaticPDFHub - Generación automática de documentos
      </Text>
    </Flex>
  );
};

export default PDFGeneratorCard;
