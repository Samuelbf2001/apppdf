import apiClient from './apiClient';

/**
 * Servicio para interacciones con HubSpot API
 * Maneja obtención de propiedades y datos de objetos
 */

export interface HubSpotProperty {
  name: string;
  label: string;
  type: string;
  fieldType: string;
  description?: string;
  options?: Array<{
    label: string;
    value: string;
  }>;
}

export interface HubSpotContact {
  id: string;
  properties: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface HubSpotDeal {
  id: string;
  properties: Record<string, any>;
  associations?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface HubSpotCompany {
  id: string;
  properties: Record<string, any>;
  associations?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface PropertiesResponse {
  success: boolean;
  data: HubSpotProperty[];
  message: string;
}

export interface ContactResponse {
  success: boolean;
  data: HubSpotContact;
  message: string;
}

export interface ContactsSearchResponse {
  success: boolean;
  data: HubSpotContact[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message: string;
}

export const hubspotService = {
  /**
   * Obtener propiedades disponibles de un objeto de HubSpot
   */
  async getProperties(objectType: 'contacts' | 'deals' | 'companies'): Promise<HubSpotProperty[]> {
    const response = await apiClient.get<PropertiesResponse>(`/hubspot/properties?object=${objectType}`);
    return response.data;
  },

  /**
   * Obtener todas las propiedades de todos los objetos
   */
  async getAllProperties(): Promise<{
    contacts: HubSpotProperty[];
    deals: HubSpotProperty[];
    companies: HubSpotProperty[];
  }> {
    const [contacts, deals, companies] = await Promise.all([
      this.getProperties('contacts'),
      this.getProperties('deals'),
      this.getProperties('companies'),
    ]);

    return { contacts, deals, companies };
  },

  /**
   * Obtener contacto específico
   */
  async getContact(contactId: string, properties?: string[]): Promise<HubSpotContact> {
    const params = properties ? `?properties=${properties.join(',')}` : '';
    const response = await apiClient.get<ContactResponse>(`/hubspot/contacts/${contactId}${params}`);
    return response.data;
  },

  /**
   * Buscar contactos
   */
  async searchContacts(params: {
    search?: string;
    properties?: string[];
    page?: number;
    limit?: number;
  } = {}): Promise<ContactsSearchResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.properties) queryParams.append('properties', params.properties.join(','));
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const url = `/hubspot/contacts${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<ContactsSearchResponse>(url);
  },

  /**
   * Obtener deal específico
   */
  async getDeal(dealId: string, properties?: string[]): Promise<HubSpotDeal> {
    const params = properties ? `?properties=${properties.join(',')}` : '';
    const response = await apiClient.get<{ success: boolean; data: HubSpotDeal; message: string }>(
      `/hubspot/deals/${dealId}${params}`
    );
    return response.data;
  },

  /**
   * Obtener company específica
   */
  async getCompany(companyId: string, properties?: string[]): Promise<HubSpotCompany> {
    const params = properties ? `?properties=${properties.join(',')}` : '';
    const response = await apiClient.get<{ success: boolean; data: HubSpotCompany; message: string }>(
      `/hubspot/companies/${companyId}${params}`
    );
    return response.data;
  },

  /**
   * Obtener propiedades más comunes para cada objeto
   */
  getCommonProperties(): {
    contacts: Array<{ name: string; label: string; type: string }>;
    deals: Array<{ name: string; label: string; type: string }>;
    companies: Array<{ name: string; label: string; type: string }>;
  } {
    return {
      contacts: [
        { name: 'firstname', label: 'Nombre', type: 'string' },
        { name: 'lastname', label: 'Apellido', type: 'string' },
        { name: 'email', label: 'Email', type: 'string' },
        { name: 'phone', label: 'Teléfono', type: 'string' },
        { name: 'company', label: 'Empresa', type: 'string' },
        { name: 'jobtitle', label: 'Cargo', type: 'string' },
        { name: 'city', label: 'Ciudad', type: 'string' },
        { name: 'country', label: 'País', type: 'string' },
        { name: 'website', label: 'Sitio Web', type: 'string' },
      ],
      deals: [
        { name: 'dealname', label: 'Nombre del Deal', type: 'string' },
        { name: 'amount', label: 'Valor', type: 'number' },
        { name: 'dealstage', label: 'Etapa', type: 'enumeration' },
        { name: 'pipeline', label: 'Pipeline', type: 'enumeration' },
        { name: 'closedate', label: 'Fecha de Cierre', type: 'date' },
        { name: 'deal_currency_code', label: 'Moneda', type: 'enumeration' },
        { name: 'dealtype', label: 'Tipo de Deal', type: 'enumeration' },
        { name: 'description', label: 'Descripción', type: 'string' },
      ],
      companies: [
        { name: 'name', label: 'Nombre de la Empresa', type: 'string' },
        { name: 'domain', label: 'Dominio', type: 'string' },
        { name: 'industry', label: 'Industria', type: 'string' },
        { name: 'phone', label: 'Teléfono', type: 'string' },
        { name: 'city', label: 'Ciudad', type: 'string' },
        { name: 'state', label: 'Estado', type: 'string' },
        { name: 'country', label: 'País', type: 'string' },
        { name: 'website', label: 'Sitio Web', type: 'string' },
        { name: 'description', label: 'Descripción', type: 'string' },
      ],
    };
  },

  /**
   * Generar variable con formato correcto
   */
  formatVariable(objectType: 'contact' | 'deal' | 'company', propertyName: string): string {
    return `${objectType}.${propertyName}`;
  },

  /**
   * Parsear variable para obtener objeto y propiedad
   */
  parseVariable(variable: string): { objectType: string; propertyName: string } | null {
    const parts = variable.split('.');
    if (parts.length >= 2) {
      return {
        objectType: parts[0],
        propertyName: parts.slice(1).join('.'),
      };
    }
    return null;
  },

  /**
   * Validar conexión con HubSpot
   */
  async validateConnection(): Promise<boolean> {
    try {
      await this.getProperties('contacts');
      return true;
    } catch (error) {
      console.error('Error validating HubSpot connection:', error);
      return false;
    }
  },

  /**
   * Obtener información de configuración de HubSpot
   */
  async getConnectionInfo(): Promise<{
    connected: boolean;
    portalId?: string;
    scopes?: string[];
    lastSync?: string;
  }> {
    try {
      // Esta información podría venir del endpoint /auth/me o un endpoint específico
      return {
        connected: await this.validateConnection(),
        portalId: 'Unknown', // Se obtendría del contexto de usuario
        scopes: ['contacts', 'deals', 'companies'], // Scopes configurados
        lastSync: new Date().toISOString(),
      };
    } catch (error) {
      return {
        connected: false,
      };
    }
  },
};
