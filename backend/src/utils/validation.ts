import Joi from 'joi';
import { ValidationError } from '../types';

/**
 * Utilidades para validación de datos usando Joi
 * Centraliza esquemas de validación para mantener consistencia
 */

// === Esquemas de validación de Usuario ===
export const userValidation = {
  create: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Debe proporcionar un email válido',
      'any.required': 'El email es requerido',
    }),
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    tenantId: Joi.string().required(),
  }),

  update: Joi.object({
    email: Joi.string().email().optional(),
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    preferences: Joi.object().optional(),
  }),
};

// === Esquemas de validación de Template ===
export const templateValidation = {
  create: Joi.object({
    name: Joi.string().min(3).max(100).required().messages({
      'string.min': 'El nombre debe tener al menos 3 caracteres',
      'string.max': 'El nombre no puede tener más de 100 caracteres',
      'any.required': 'El nombre es requerido',
    }),
    description: Joi.string().max(500).optional(),
    content: Joi.string().required().messages({
      'any.required': 'El contenido del template es requerido',
    }),
    variables: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        label: Joi.string().required(),
        type: Joi.string().valid('contact.property', 'deal.property', 'company.property', 'custom').required(),
        required: Joi.boolean().default(false),
        defaultValue: Joi.string().optional(),
      })
    ).required(),
  }),

  update: Joi.object({
    name: Joi.string().min(3).max(100).optional(),
    description: Joi.string().max(500).optional(),
    content: Joi.string().optional(),
    variables: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        label: Joi.string().required(),
        type: Joi.string().valid('contact.property', 'deal.property', 'company.property', 'custom').required(),
        required: Joi.boolean().default(false),
        defaultValue: Joi.string().optional(),
      })
    ).optional(),
    isActive: Joi.boolean().optional(),
  }),
};

// === Esquemas de validación de Document ===
export const documentValidation = {
  generate: Joi.object({
    name: Joi.string().min(3).max(100).required(),
    templateId: Joi.string().required(),
    variables: Joi.object().required().messages({
      'any.required': 'Las variables son requeridas para generar el documento',
    }),
    hubspotObjectId: Joi.string().optional(),
    hubspotObjectType: Joi.string().valid('CONTACT', 'DEAL', 'COMPANY', 'TICKET').optional(),
  }),

  update: Joi.object({
    name: Joi.string().min(3).max(100).optional(),
    status: Joi.string().valid('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'UPLOADED').optional(),
  }),
};

// === Esquemas de validación de HubSpot ===
export const hubspotValidation = {
  objectId: Joi.string().required().messages({
    'any.required': 'ID del objeto de HubSpot es requerido',
  }),
  
  objectType: Joi.string().valid('CONTACT', 'DEAL', 'COMPANY', 'TICKET').required(),
  
  properties: Joi.object({
    object: Joi.string().valid('contact', 'deal', 'company', 'ticket').required(),
  }),
};

// === Esquemas de paginación ===
export const paginationValidation = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

// === Función helper para validar datos ===
export const validateData = <T>(schema: Joi.Schema, data: any): T => {
  const { error, value } = schema.validate(data, { 
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true,
  });

  if (error) {
    const validationErrors: ValidationError[] = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value,
    }));

    const customError: any = new Error('Error de validación');
    customError.statusCode = 400;
    customError.isOperational = true;
    customError.validationErrors = validationErrors;
    
    throw customError;
  }

  return value;
};

// === Función helper para validar ID ===
export const validateId = (id: string, fieldName: string = 'id'): string => {
  const schema = Joi.string().required().messages({
    'any.required': `${fieldName} es requerido`,
    'string.empty': `${fieldName} no puede estar vacío`,
  });

  return validateData(schema, id);
};

// === Función helper para validar query parameters ===
export const validateQuery = (query: any) => {
  return validateData(paginationValidation, query);
};
