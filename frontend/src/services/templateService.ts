import apiClient from './apiClient';

/**
 * Servicio para gestión de templates
 * Maneja CRUD de templates y funcionalidades relacionadas
 */

export interface TemplateVariable {
  name: string; // e.g., "contact.firstname"
  label: string; // e.g., "Nombre del contacto"
  type: 'contact.property' | 'deal.property' | 'company.property' | 'custom';
  required: boolean;
  defaultValue?: string;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  content: string; // HTML content con variables
  variables: TemplateVariable[];
  isActive: boolean;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  _count?: {
    documents: number;
  };
  documents?: Array<{
    id: string;
    name: string;
    status: string;
    createdAt: string;
  }>;
}

export interface CreateTemplateData {
  name: string;
  description?: string;
  content: string;
  variables: TemplateVariable[];
}

export interface UpdateTemplateData {
  name?: string;
  description?: string;
  content?: string;
  variables?: TemplateVariable[];
  isActive?: boolean;
}

export interface TemplateFilters {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TemplatesResponse {
  success: boolean;
  data: Template[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message: string;
}

export interface TemplateResponse {
  success: boolean;
  data: Template;
  message: string;
}

export const templateService = {
  /**
   * Obtener lista de templates con filtros y paginación
   */
  async getTemplates(filters: TemplateFilters = {}): Promise<TemplatesResponse> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const queryString = params.toString();
    const url = `/templates${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<TemplatesResponse>(url);
  },

  /**
   * Obtener template específico por ID
   */
  async getTemplate(id: string): Promise<TemplateResponse> {
    return apiClient.get<TemplateResponse>(`/templates/${id}`);
  },

  /**
   * Crear nuevo template
   */
  async createTemplate(data: CreateTemplateData): Promise<TemplateResponse> {
    return apiClient.post<TemplateResponse>('/templates', data);
  },

  /**
   * Actualizar template existente
   */
  async updateTemplate(id: string, data: UpdateTemplateData): Promise<TemplateResponse> {
    return apiClient.put<TemplateResponse>(`/templates/${id}`, data);
  },

  /**
   * Eliminar template
   */
  async deleteTemplate(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete(`/templates/${id}`);
  },

  /**
   * Duplicar template existente
   */
  async duplicateTemplate(id: string, name: string): Promise<TemplateResponse> {
    return apiClient.post<TemplateResponse>(`/templates/${id}/duplicate`, { name });
  },

  /**
   * Obtener templates para selector (formato simplificado)
   */
  async getTemplatesForSelector(): Promise<Array<{ id: string; name: string; description?: string }>> {
    const response = await this.getTemplates({ 
      isActive: true, 
      limit: 100,
      sortBy: 'name',
      sortOrder: 'asc'
    });
    
    return response.data.map(template => ({
      id: template.id,
      name: template.name,
      description: template.description,
    }));
  },

  /**
   * Validar nombre de template (verificar duplicados)
   */
  async validateTemplateName(name: string, excludeId?: string): Promise<boolean> {
    try {
      const response = await this.getTemplates({ search: name, limit: 1 });
      const existingTemplate = response.data.find(t => 
        t.name.toLowerCase() === name.toLowerCase() && t.id !== excludeId
      );
      return !existingTemplate; // true si no existe (es válido)
    } catch (error) {
      console.error('Error validando nombre de template:', error);
      return false;
    }
  },

  /**
   * Obtener estadísticas de templates
   */
  async getTemplateStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    totalDocuments: number;
  }> {
    try {
      const response = await this.getTemplates({ limit: 1000 }); // Obtener todos
      const templates = response.data;
      
      const stats = {
        total: templates.length,
        active: templates.filter(t => t.isActive).length,
        inactive: templates.filter(t => !t.isActive).length,
        totalDocuments: templates.reduce((sum, t) => sum + (t._count?.documents || 0), 0),
      };
      
      return stats;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  },

  /**
   * Buscar templates por contenido o variables
   */
  async searchTemplates(query: string): Promise<Template[]> {
    const response = await this.getTemplates({ 
      search: query, 
      limit: 50,
      sortBy: 'updatedAt',
      sortOrder: 'desc'
    });
    
    return response.data;
  },

  /**
   * Obtener templates recientes
   */
  async getRecentTemplates(limit: number = 5): Promise<Template[]> {
    const response = await this.getTemplates({ 
      limit, 
      sortBy: 'updatedAt', 
      sortOrder: 'desc' 
    });
    
    return response.data;
  },

  /**
   * Exportar template (para backup o migración)
   */
  async exportTemplate(id: string): Promise<{
    template: Template;
    exportedAt: string;
    version: string;
  }> {
    const response = await this.getTemplate(id);
    
    return {
      template: response.data,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };
  },
};
