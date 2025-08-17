/**
 * Tipos principales de la aplicación
 * Definiciones de interfaces y tipos compartidos
 */

// === Tipos de Usuario ===
export interface User {
  id: string;
  email: string;
  tenantId: string;
  hubspotPortalId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tenant {
  id: string;
  name: string;
  hubspotPortalId: string;
  hubspotAccessToken?: string;
  hubspotRefreshToken?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// === Tipos de Template ===
export interface Template {
  id: string;
  name: string;
  description?: string;
  content: string; // HTML content con variables
  variables: TemplateVariable[];
  tenantId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // User ID
}

export interface TemplateVariable {
  name: string; // e.g., "contact.firstname"
  label: string; // e.g., "Nombre del contacto"
  type: VariableType;
  required: boolean;
  defaultValue?: string;
}

export type VariableType = 
  | 'contact.property'
  | 'deal.property'
  | 'company.property'
  | 'custom';

// === Tipos de Documento ===
export interface Document {
  id: string;
  templateId: string;
  name: string;
  status: DocumentStatus;
  filePath?: string; // Path al archivo PDF generado
  fileUrl?: string; // URL de descarga
  variables: Record<string, any>; // Valores de las variables
  hubspotObjectId?: string; // ID del objeto de HubSpot asociado
  hubspotObjectType?: HubSpotObjectType;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // User ID
}

export type DocumentStatus = 
  | 'pending'    // En cola para procesamiento
  | 'processing' // Generándose
  | 'completed'  // Completado exitosamente
  | 'failed'     // Error en generación
  | 'uploaded';  // Subido a HubSpot

export type HubSpotObjectType = 'contact' | 'deal' | 'company' | 'ticket';

// === Tipos de HubSpot ===
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
  associations?: HubSpotAssociation[];
  createdAt: string;
  updatedAt: string;
}

export interface HubSpotCompany {
  id: string;
  properties: Record<string, any>;
  associations?: HubSpotAssociation[];
  createdAt: string;
  updatedAt: string;
}

export interface HubSpotAssociation {
  to: {
    id: string;
  };
  type: string;
}

// === Tipos de API Response ===
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// === Tipos de Queue Jobs ===
export interface DocumentGenerationJob {
  documentId: string;
  templateId: string;
  variables: Record<string, any>;
  tenantId: string;
  userId: string;
}

export interface HubSpotUploadJob {
  documentId: string;
  filePath: string;
  hubspotObjectId: string;
  hubspotObjectType: HubSpotObjectType;
  tenantId: string;
  userId: string;
}

// === Tipos de Configuración ===
export interface AppConfig {
  port: number;
  nodeEnv: string;
  jwtSecret: string;
  databaseUrl: string;
  redisUrl: string;
  gotenbergUrl: string;
  hubspotClientId: string;
  hubspotClientSecret: string;
  hubspotRedirectUri: string;
  frontendUrl: string;
  awsS3Bucket?: string;
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
  logLevel: string;
}

// === Tipos de Error ===
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ApiError {
  message: string;
  statusCode: number;
  isOperational: boolean;
  stack?: string;
  validationErrors?: ValidationError[];
}
