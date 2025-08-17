import axios from 'axios';
import jwt from 'jsonwebtoken';
import { logger } from '../config/logger';
import prisma from '../config/database';
import { createError } from '../middleware/errorHandler';

/**
 * Servicio para manejar autenticación OAuth2 con HubSpot
 * Gestiona el flujo completo de OAuth, tokens y refresh
 */

interface HubSpotTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  hub_domain?: string;
  hub_id?: number;
}

interface HubSpotUserInfo {
  user: string;
  hub_domain: string;
  hub_id: number;
  app_id: number;
  expires_in: number;
  user_id: number;
  token_type: string;
}

export class HubSpotAuthService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly baseUrl = 'https://api.hubapi.com';

  constructor() {
    this.clientId = process.env.HUBSPOT_CLIENT_ID!;
    this.clientSecret = process.env.HUBSPOT_CLIENT_SECRET!;
    this.redirectUri = process.env.HUBSPOT_REDIRECT_URI!;

    if (!this.clientId || !this.clientSecret || !this.redirectUri) {
      throw new Error('Variables de entorno de HubSpot no configuradas correctamente');
    }
  }

  /**
   * Genera URL de autorización OAuth2 de HubSpot
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: [
        'contacts',
        'content',
        'reports',
        'social',
        'automation',
        'timeline',
        'business-intelligence',
        'files',
        'hubdb',
        'integration-sync',
        'tickets',
        'e-commerce',
        'accounting',
        'sales-email-read',
        'forms',
        'crm.objects.deals.read',
        'crm.objects.deals.write',
        'crm.objects.contacts.read',
        'crm.objects.contacts.write',
        'crm.objects.companies.read',
        'crm.objects.companies.write',
        'files.ui_hidden.read'
      ].join(' '),
      response_type: 'code',
    });

    if (state) {
      params.append('state', state);
    }

    return `https://app.hubspot.com/oauth/authorize?${params.toString()}`;
  }

  /**
   * Intercambia código de autorización por tokens de acceso
   */
  async exchangeCodeForTokens(code: string): Promise<HubSpotTokenResponse> {
    try {
      logger.info('Intercambiando código de autorización por tokens');

      const response = await axios.post(
        'https://api.hubapi.com/oauth/v1/token',
        {
          grant_type: 'authorization_code',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          redirect_uri: this.redirectUri,
          code,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      logger.info('Tokens obtenidos exitosamente de HubSpot');
      return response.data;
    } catch (error: any) {
      logger.error('Error intercambiando código por tokens:', {
        error: error.response?.data || error.message,
        status: error.response?.status,
      });
      throw createError('Error obteniendo tokens de HubSpot', 400);
    }
  }

  /**
   * Obtiene información del usuario y portal de HubSpot
   */
  async getUserInfo(accessToken: string): Promise<HubSpotUserInfo> {
    try {
      logger.info('Obteniendo información de usuario de HubSpot');

      const response = await axios.get(
        `${this.baseUrl}/oauth/v1/access-tokens/${accessToken}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      logger.info('Información de usuario obtenida:', {
        hubId: response.data.hub_id,
        userId: response.data.user_id,
      });

      return response.data;
    } catch (error: any) {
      logger.error('Error obteniendo información de usuario:', {
        error: error.response?.data || error.message,
        status: error.response?.status,
      });
      throw createError('Error obteniendo información de usuario de HubSpot', 400);
    }
  }

  /**
   * Refresca el access token usando refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<HubSpotTokenResponse> {
    try {
      logger.info('Refrescando access token de HubSpot');

      const response = await axios.post(
        'https://api.hubapi.com/oauth/v1/token',
        {
          grant_type: 'refresh_token',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: refreshToken,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      logger.info('Access token refrescado exitosamente');
      return response.data;
    } catch (error: any) {
      logger.error('Error refrescando access token:', {
        error: error.response?.data || error.message,
        status: error.response?.status,
      });
      throw createError('Error refrescando token de HubSpot', 400);
    }
  }

  /**
   * Proceso completo de autenticación OAuth2
   * Maneja creación/actualización de tenant y usuario
   */
  async handleOAuthCallback(code: string, userEmail?: string): Promise<{
    user: any;
    tenant: any;
    accessToken: string;
  }> {
    try {
      // 1. Intercambiar código por tokens
      const tokens = await this.exchangeCodeForTokens(code);
      
      // 2. Obtener información del usuario
      const userInfo = await this.getUserInfo(tokens.access_token);
      
      // 3. Calcular fecha de expiración
      const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

      // 4. Buscar o crear tenant
      let tenant = await prisma.tenant.findUnique({
        where: { hubspotPortalId: userInfo.hub_id.toString() }
      });

      if (!tenant) {
        tenant = await prisma.tenant.create({
          data: {
            name: userInfo.hub_domain || `Portal ${userInfo.hub_id}`,
            hubspotPortalId: userInfo.hub_id.toString(),
            hubspotAccessToken: tokens.access_token,
            hubspotRefreshToken: tokens.refresh_token,
            hubspotExpiresAt: expiresAt,
            isActive: true,
          },
        });
        
        logger.info('Nuevo tenant creado:', {
          tenantId: tenant.id,
          hubspotPortalId: tenant.hubspotPortalId,
        });
      } else {
        // Actualizar tokens existentes
        tenant = await prisma.tenant.update({
          where: { id: tenant.id },
          data: {
            hubspotAccessToken: tokens.access_token,
            hubspotRefreshToken: tokens.refresh_token,
            hubspotExpiresAt: expiresAt,
            isActive: true,
          },
        });
        
        logger.info('Tokens de tenant actualizados:', {
          tenantId: tenant.id,
        });
      }

      // 5. Buscar o crear usuario
      const email = userEmail || `user${userInfo.user_id}@${userInfo.hub_domain}`;
      
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { hubspotUserId: userInfo.user_id.toString() }
          ],
          tenantId: tenant.id,
        }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            tenantId: tenant.id,
            hubspotUserId: userInfo.user_id.toString(),
            isActive: true,
            lastLoginAt: new Date(),
          },
        });
        
        logger.info('Nuevo usuario creado:', {
          userId: user.id,
          email: user.email,
          tenantId: tenant.id,
        });
      } else {
        // Actualizar última conexión
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            lastLoginAt: new Date(),
            hubspotUserId: userInfo.user_id.toString(),
          },
        });
        
        logger.info('Usuario existente actualizado:', {
          userId: user.id,
        });
      }

      // 6. Generar JWT token para la aplicación
      const jwtToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          tenantId: tenant.id,
          hubspotPortalId: tenant.hubspotPortalId,
        },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      // 7. Log de auditoría
      await prisma.auditLog.create({
        data: {
          action: 'LOGIN',
          entityType: 'user',
          entityId: user.id,
          userId: user.id,
          userEmail: user.email,
          tenantId: tenant.id,
          newValues: {
            loginMethod: 'hubspot_oauth',
            hubspotPortalId: tenant.hubspotPortalId,
          },
        },
      });

      return {
        user,
        tenant,
        accessToken: jwtToken,
      };
    } catch (error) {
      logger.error('Error en callback de OAuth:', error);
      throw error;
    }
  }

  /**
   * Obtiene un access token válido para un tenant
   * Refresca automáticamente si es necesario
   */
  async getValidAccessToken(tenantId: string): Promise<string> {
    try {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId }
      });

      if (!tenant || !tenant.hubspotAccessToken) {
        throw createError('Tenant no encontrado o sin tokens de HubSpot', 404);
      }

      // Verificar si el token necesita ser refrescado
      if (tenant.hubspotExpiresAt && tenant.hubspotExpiresAt <= new Date()) {
        logger.info('Token expirado, refrescando...', { tenantId });
        
        if (!tenant.hubspotRefreshToken) {
          throw createError('No hay refresh token disponible', 400);
        }

        const newTokens = await this.refreshAccessToken(tenant.hubspotRefreshToken);
        const newExpiresAt = new Date(Date.now() + newTokens.expires_in * 1000);

        await prisma.tenant.update({
          where: { id: tenantId },
          data: {
            hubspotAccessToken: newTokens.access_token,
            hubspotRefreshToken: newTokens.refresh_token,
            hubspotExpiresAt: newExpiresAt,
          },
        });

        return newTokens.access_token;
      }

      return tenant.hubspotAccessToken;
    } catch (error) {
      logger.error('Error obteniendo access token válido:', error);
      throw error;
    }
  }

  /**
   * Desconecta un tenant de HubSpot
   */
  async disconnectTenant(tenantId: string): Promise<void> {
    try {
      await prisma.tenant.update({
        where: { id: tenantId },
        data: {
          hubspotAccessToken: null,
          hubspotRefreshToken: null,
          hubspotExpiresAt: null,
          isActive: false,
        },
      });

      logger.info('Tenant desconectado de HubSpot:', { tenantId });
    } catch (error) {
      logger.error('Error desconectando tenant:', error);
      throw error;
    }
  }
}

// Singleton instance
export const hubspotAuthService = new HubSpotAuthService();
