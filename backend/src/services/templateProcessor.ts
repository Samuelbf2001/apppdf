import { logger } from '../config/logger';
import { hubspotApiService } from './hubspotApi';
import { TemplateVariable } from '../types';

/**
 * Servicio para procesar templates y variables
 * Maneja validación, procesamiento y reemplazo de variables dinámicas
 */

interface VariableValue {
  name: string;
  value: any;
  type: string;
}

interface ProcessingContext {
  tenantId: string;
  hubspotObjectId?: string;
  hubspotObjectType?: 'CONTACT' | 'DEAL' | 'COMPANY';
  variables: Record<string, any>;
}

export class TemplateProcessorService {

  /**
   * Extrae todas las variables de un contenido HTML
   * Busca patrones como {{variable.name}}
   */
  extractVariablesFromContent(content: string): string[] {
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const variables: string[] = [];
    let match;

    while ((match = variableRegex.exec(content)) !== null) {
      const variableName = match[1].trim();
      if (!variables.includes(variableName)) {
        variables.push(variableName);
      }
    }

    logger.debug('Variables extraídas del contenido:', { 
      variables,
      count: variables.length 
    });

    return variables;
  }

  /**
   * Valida que las variables requeridas estén presentes
   */
  validateRequiredVariables(
    templateVariables: TemplateVariable[], 
    providedVariables: Record<string, any>
  ): { isValid: boolean; missingVariables: string[] } {
    const missingVariables: string[] = [];

    for (const templateVar of templateVariables) {
      if (templateVar.required && !providedVariables.hasOwnProperty(templateVar.name)) {
        missingVariables.push(templateVar.name);
      }
    }

    const isValid = missingVariables.length === 0;

    logger.debug('Validación de variables requeridas:', {
      isValid,
      missingVariables,
      requiredCount: templateVariables.filter(v => v.required).length,
      providedCount: Object.keys(providedVariables).length,
    });

    return { isValid, missingVariables };
  }

  /**
   * Resuelve variables de HubSpot obteniendo datos de la API
   */
  async resolveHubSpotVariables(
    context: ProcessingContext,
    templateVariables: TemplateVariable[]
  ): Promise<Record<string, any>> {
    const resolvedVariables: Record<string, any> = { ...context.variables };

    try {
      // Filtrar variables que necesitan datos de HubSpot
      const hubspotVariables = templateVariables.filter(
        v => v.type === 'contact.property' || v.type === 'deal.property' || v.type === 'company.property'
      );

      if (hubspotVariables.length === 0) {
        logger.debug('No hay variables de HubSpot para resolver');
        return resolvedVariables;
      }

      if (!context.hubspotObjectId || !context.hubspotObjectType) {
        logger.warn('Variables de HubSpot encontradas pero no hay objeto de contexto');
        return resolvedVariables;
      }

      logger.info('Resolviendo variables de HubSpot:', {
        objectId: context.hubspotObjectId,
        objectType: context.hubspotObjectType,
        variablesCount: hubspotVariables.length,
        tenantId: context.tenantId,
      });

      // Obtener datos del objeto principal
      let objectData: any = null;

      if (context.hubspotObjectType === 'CONTACT') {
        objectData = await hubspotApiService.getContact(
          context.tenantId,
          context.hubspotObjectId
        );
      } else if (context.hubspotObjectType === 'DEAL') {
        objectData = await hubspotApiService.getDeal(
          context.tenantId,
          context.hubspotObjectId
        );
      } else if (context.hubspotObjectType === 'COMPANY') {
        objectData = await hubspotApiService.getCompany(
          context.tenantId,
          context.hubspotObjectId
        );
      }

      if (!objectData) {
        logger.warn('No se pudieron obtener datos del objeto de HubSpot');
        return resolvedVariables;
      }

      // Resolver cada variable de HubSpot
      for (const variable of hubspotVariables) {
        try {
          const [objectType, propertyName] = variable.name.split('.');
          
          if (objectType === 'contact' && context.hubspotObjectType === 'CONTACT') {
            resolvedVariables[variable.name] = objectData.properties[propertyName] || variable.defaultValue || '';
          } else if (objectType === 'deal' && context.hubspotObjectType === 'DEAL') {
            resolvedVariables[variable.name] = objectData.properties[propertyName] || variable.defaultValue || '';
          } else if (objectType === 'company' && context.hubspotObjectType === 'COMPANY') {
            resolvedVariables[variable.name] = objectData.properties[propertyName] || variable.defaultValue || '';
          }

          logger.debug('Variable de HubSpot resuelta:', {
            variable: variable.name,
            value: resolvedVariables[variable.name],
            hasValue: !!resolvedVariables[variable.name],
          });
        } catch (error) {
          logger.warn('Error resolviendo variable individual:', {
            variable: variable.name,
            error: (error as Error).message,
          });
          resolvedVariables[variable.name] = variable.defaultValue || '';
        }
      }

      logger.info('Variables de HubSpot resueltas exitosamente:', {
        resolvedCount: hubspotVariables.length,
        tenantId: context.tenantId,
      });

    } catch (error) {
      logger.error('Error resolviendo variables de HubSpot:', {
        error: (error as Error).message,
        tenantId: context.tenantId,
        objectId: context.hubspotObjectId,
      });
    }

    return resolvedVariables;
  }

  /**
   * Procesa variables personalizadas (custom)
   */
  processCustomVariables(variables: Record<string, any>): Record<string, any> {
    const processedVariables = { ...variables };

    // Variable de fecha actual
    if (!processedVariables['current_date']) {
      processedVariables['current_date'] = new Date().toLocaleDateString('es-MX');
    }

    // Variable de fecha y hora actual
    if (!processedVariables['current_datetime']) {
      processedVariables['current_datetime'] = new Date().toLocaleString('es-MX');
    }

    // Variable de año actual
    if (!processedVariables['current_year']) {
      processedVariables['current_year'] = new Date().getFullYear().toString();
    }

    // Variable de mes actual
    if (!processedVariables['current_month']) {
      const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      processedVariables['current_month'] = months[new Date().getMonth()];
    }

    logger.debug('Variables personalizadas procesadas:', {
      addedVariables: ['current_date', 'current_datetime', 'current_year', 'current_month'],
    });

    return processedVariables;
  }

  /**
   * Reemplaza variables en el contenido HTML
   */
  replaceVariablesInContent(content: string, variables: Record<string, any>): string {
    let processedContent = content;

    // Reemplazar cada variable
    Object.keys(variables).forEach(variableName => {
      const variablePattern = new RegExp(`\\{\\{\\s*${variableName}\\s*\\}\\}`, 'g');
      const variableValue = this.formatVariableValue(variables[variableName]);
      processedContent = processedContent.replace(variablePattern, variableValue);
    });

    // Limpiar variables no resueltas (opcional - remover {{}} vacías)
    processedContent = processedContent.replace(/\{\{[^}]*\}\}/g, '');

    logger.debug('Variables reemplazadas en contenido:', {
      originalLength: content.length,
      processedLength: processedContent.length,
      variablesCount: Object.keys(variables).length,
    });

    return processedContent;
  }

  /**
   * Formatea el valor de una variable para mostrar correctamente
   */
  private formatVariableValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'number') {
      return value.toLocaleString('es-MX');
    }

    if (value instanceof Date) {
      return value.toLocaleDateString('es-MX');
    }

    if (typeof value === 'boolean') {
      return value ? 'Sí' : 'No';
    }

    // Para objetos y arrays, convertir a JSON string
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  /**
   * Procesa completamente un template con variables
   * Método principal que orquesta todo el procesamiento
   */
  async processTemplate(
    content: string,
    templateVariables: TemplateVariable[],
    context: ProcessingContext
  ): Promise<{ processedContent: string; resolvedVariables: Record<string, any> }> {
    try {
      logger.info('Iniciando procesamiento de template:', {
        templateVariablesCount: templateVariables.length,
        providedVariablesCount: Object.keys(context.variables).length,
        tenantId: context.tenantId,
        hasHubSpotContext: !!context.hubspotObjectId,
      });

      // 1. Validar variables requeridas
      const validation = this.validateRequiredVariables(templateVariables, context.variables);
      if (!validation.isValid) {
        throw new Error(`Variables requeridas faltantes: ${validation.missingVariables.join(', ')}`);
      }

      // 2. Resolver variables de HubSpot
      const resolvedVariables = await this.resolveHubSpotVariables(context, templateVariables);

      // 3. Procesar variables personalizadas
      const processedVariables = this.processCustomVariables(resolvedVariables);

      // 4. Reemplazar variables en el contenido
      const processedContent = this.replaceVariablesInContent(content, processedVariables);

      logger.info('Template procesado exitosamente:', {
        finalVariablesCount: Object.keys(processedVariables).length,
        contentLengthChange: `${content.length} -> ${processedContent.length}`,
        tenantId: context.tenantId,
      });

      return {
        processedContent,
        resolvedVariables: processedVariables,
      };

    } catch (error) {
      logger.error('Error procesando template:', {
        error: (error as Error).message,
        tenantId: context.tenantId,
        templateVariablesCount: templateVariables.length,
      });
      throw error;
    }
  }
}

// Singleton instance
export const templateProcessorService = new TemplateProcessorService();
