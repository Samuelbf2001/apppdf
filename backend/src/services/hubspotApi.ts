import axios, { AxiosInstance } from 'axios';
import { logger } from '../config/logger';
import { hubspotAuthService } from './hubspotAuth';
import { createError } from '../middleware/errorHandler';
import { HubSpotProperty, HubSpotContact, HubSpotDeal, HubSpotCompany } from '../types';

/**
 * Servicio para interactuar con la API de HubSpot
 * Maneja todas las operaciones CRUD con objetos de HubSpot
 */
export class HubSpotApiService {
  private readonly baseUrl = 'https://api.hubapi.com';
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para logging de requests
    this.axiosInstance.interceptors.request.use(
      (config) => {
        logger.debug('HubSpot API Request:', {
          method: config.method,
          url: config.url,
          params: config.params,
        });
        return config;
      },
      (error) => {
        logger.error('HubSpot API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Interceptor para logging de responses
    this.axiosInstance.interceptors.response.use(
      (response) => {
        logger.debug('HubSpot API Response:', {
          status: response.status,
          url: response.config.url,
        });
        return response;
      },
      (error) => {
        logger.error('HubSpot API Response Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          data: error.response?.data,
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Obtiene headers de autorización para un tenant
   */
  private async getAuthHeaders(tenantId: string) {
    const accessToken = await hubspotAuthService.getValidAccessToken(tenantId);
    return {
      Authorization: `Bearer ${accessToken}`,
    };
  }

  // ========================================
  // MÉTODOS PARA PROPIEDADES
  // ========================================

  /**
   * Obtiene propiedades de un objeto específico (contacts, deals, companies)
   */
  async getProperties(tenantId: string, objectType: 'contacts' | 'deals' | 'companies'): Promise<HubSpotProperty[]> {
    try {
      logger.info('Obteniendo propiedades de HubSpot:', { objectType, tenantId });

      const headers = await this.getAuthHeaders(tenantId);
      const response = await this.axiosInstance.get(
        `/crm/v3/properties/${objectType}`,
        { headers }
      );

      const properties = response.data.results.map((prop: any) => ({
        name: prop.name,
        label: prop.label,
        type: prop.type,
        fieldType: prop.fieldType,
        description: prop.description,
        options: prop.options || [],
      }));

      logger.info('Propiedades obtenidas exitosamente:', { 
        objectType, 
        count: properties.length,
        tenantId 
      });

      return properties;
    } catch (error: any) {
      logger.error('Error obteniendo propiedades:', {
        objectType,
        tenantId,
        error: error.response?.data || error.message,
      });
      throw createError(`Error obteniendo propiedades de ${objectType}`, error.response?.status || 500);
    }
  }

  // ========================================
  // MÉTODOS PARA CONTACTOS
  // ========================================

  /**
   * Obtiene un contacto por ID
   */
  async getContact(tenantId: string, contactId: string, properties?: string[]): Promise<HubSpotContact> {
    try {
      logger.info('Obteniendo contacto:', { contactId, tenantId });

      const headers = await this.getAuthHeaders(tenantId);
      const params: any = {};
      
      if (properties && properties.length > 0) {
        params.properties = properties.join(',');
      }

      const response = await this.axiosInstance.get(
        `/crm/v3/objects/contacts/${contactId}`,
        { headers, params }
      );

      logger.info('Contacto obtenido exitosamente:', { contactId, tenantId });
      
      return {
        id: response.data.id,
        properties: response.data.properties,
        createdAt: response.data.createdAt,
        updatedAt: response.data.updatedAt,
      };
    } catch (error: any) {
      logger.error('Error obteniendo contacto:', {
        contactId,
        tenantId,
        error: error.response?.data || error.message,
      });
      throw createError('Error obteniendo contacto de HubSpot', error.response?.status || 500);
    }
  }

  /**
   * Busca contactos con filtros
   */
  async searchContacts(
    tenantId: string, 
    filters?: any[], 
    properties?: string[],
    limit: number = 10
  ): Promise<{ results: HubSpotContact[]; total: number }> {
    try {
      logger.info('Buscando contactos:', { tenantId, filters, limit });

      const headers = await this.getAuthHeaders(tenantId);
      const searchBody: any = {
        limit,
        properties: properties || ['firstname', 'lastname', 'email'],
      };

      if (filters && filters.length > 0) {
        searchBody.filterGroups = [{ filters }];
      }

      const response = await this.axiosInstance.post(
        '/crm/v3/objects/contacts/search',
        searchBody,
        { headers }
      );

      const contacts = response.data.results.map((contact: any) => ({
        id: contact.id,
        properties: contact.properties,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt,
      }));

      logger.info('Contactos encontrados:', { 
        count: contacts.length, 
        total: response.data.total,
        tenantId 
      });

      return {
        results: contacts,
        total: response.data.total || contacts.length,
      };
    } catch (error: any) {
      logger.error('Error buscando contactos:', {
        tenantId,
        error: error.response?.data || error.message,
      });
      throw createError('Error buscando contactos en HubSpot', error.response?.status || 500);
    }
  }

  // ========================================
  // MÉTODOS PARA DEALS
  // ========================================

  /**
   * Obtiene un deal por ID
   */
  async getDeal(tenantId: string, dealId: string, properties?: string[]): Promise<HubSpotDeal> {
    try {
      logger.info('Obteniendo deal:', { dealId, tenantId });

      const headers = await this.getAuthHeaders(tenantId);
      const params: any = {};
      
      if (properties && properties.length > 0) {
        params.properties = properties.join(',');
      }

      const response = await this.axiosInstance.get(
        `/crm/v3/objects/deals/${dealId}`,
        { headers, params }
      );

      logger.info('Deal obtenido exitosamente:', { dealId, tenantId });

      return {
        id: response.data.id,
        properties: response.data.properties,
        associations: response.data.associations,
        createdAt: response.data.createdAt,
        updatedAt: response.data.updatedAt,
      };
    } catch (error: any) {
      logger.error('Error obteniendo deal:', {
        dealId,
        tenantId,
        error: error.response?.data || error.message,
      });
      throw createError('Error obteniendo deal de HubSpot', error.response?.status || 500);
    }
  }

  // ========================================
  // MÉTODOS PARA COMPANIES
  // ========================================

  /**
   * Obtiene una company por ID
   */
  async getCompany(tenantId: string, companyId: string, properties?: string[]): Promise<HubSpotCompany> {
    try {
      logger.info('Obteniendo company:', { companyId, tenantId });

      const headers = await this.getAuthHeaders(tenantId);
      const params: any = {};
      
      if (properties && properties.length > 0) {
        params.properties = properties.join(',');
      }

      const response = await this.axiosInstance.get(
        `/crm/v3/objects/companies/${companyId}`,
        { headers, params }
      );

      logger.info('Company obtenida exitosamente:', { companyId, tenantId });

      return {
        id: response.data.id,
        properties: response.data.properties,
        associations: response.data.associations,
        createdAt: response.data.createdAt,
        updatedAt: response.data.updatedAt,
      };
    } catch (error: any) {
      logger.error('Error obteniendo company:', {
        companyId,
        tenantId,
        error: error.response?.data || error.message,
      });
      throw createError('Error obteniendo company de HubSpot', error.response?.status || 500);
    }
  }

  // ========================================
  // MÉTODOS PARA ARCHIVOS
  // ========================================

  /**
   * Sube un archivo a HubSpot Files
   */
  async uploadFile(
    tenantId: string,
    fileName: string,
    fileBuffer: Buffer,
    options?: {
      folderId?: string;
      folderPath?: string;
      overwrite?: boolean;
    }
  ): Promise<{ id: string; url: string }> {
    try {
      logger.info('Subiendo archivo a HubSpot:', { fileName, tenantId });

      const headers = await this.getAuthHeaders(tenantId);
      const formData = new FormData();
      
      // Crear blob del archivo
      const blob = new Blob([fileBuffer]);
      formData.append('file', blob, fileName);
      
      if (options?.folderId) {
        formData.append('folderId', options.folderId);
      }
      
      if (options?.folderPath) {
        formData.append('folderPath', options.folderPath);
      }

      const response = await this.axiosInstance.post(
        '/filemanager/api/v3/files/upload',
        formData,
        {
          headers: {
            ...headers,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      logger.info('Archivo subido exitosamente:', { 
        fileId: response.data.id,
        fileName,
        tenantId 
      });

      return {
        id: response.data.id,
        url: response.data.url,
      };
    } catch (error: any) {
      logger.error('Error subiendo archivo:', {
        fileName,
        tenantId,
        error: error.response?.data || error.message,
      });
      throw createError('Error subiendo archivo a HubSpot', error.response?.status || 500);
    }
  }

  /**
   * Attacha un archivo a un objeto de HubSpot
   */
  async attachFileToObject(
    tenantId: string,
    fileId: string,
    objectType: 'contact' | 'deal' | 'company',
    objectId: string
  ): Promise<void> {
    try {
      logger.info('Attachando archivo a objeto:', { 
        fileId, 
        objectType, 
        objectId, 
        tenantId 
      });

      const headers = await this.getAuthHeaders(tenantId);
      
      await this.axiosInstance.put(
        `/crm/v3/objects/${objectType}s/${objectId}/associations/file/${fileId}`,
        {},
        { headers }
      );

      logger.info('Archivo attachado exitosamente:', { 
        fileId, 
        objectType, 
        objectId,
        tenantId 
      });
    } catch (error: any) {
      logger.error('Error attachando archivo:', {
        fileId,
        objectType,
        objectId,
        tenantId,
        error: error.response?.data || error.message,
      });
      throw createError('Error attachando archivo en HubSpot', error.response?.status || 500);
    }
  }
}

// Singleton instance
export const hubspotApiService = new HubSpotApiService();
