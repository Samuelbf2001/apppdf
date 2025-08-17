import apiClient from './apiClient';

/**
 * Servicio de autenticación
 * Maneja login, logout y información del usuario
 */

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  tenant: {
    id: string;
    name: string;
    hubspotPortalId: string;
    isActive: boolean;
  };
  preferences?: Record<string, any>;
  lastLoginAt?: string;
  createdAt: string;
}

interface LoginResponse {
  success: boolean;
  data: {
    accessToken: string;
    user: User;
  };
}

interface AuthResponse {
  success: boolean;
  data: User;
}

export const authService = {
  /**
   * Obtener información del usuario actual
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<AuthResponse>('/auth/me');
    return response.data;
  },

  /**
   * Iniciar proceso de autenticación con HubSpot
   */
  async initiateHubSpotAuth(): Promise<string> {
    const response = await apiClient.get<{
      success: boolean;
      authUrl: string;
    }>('/auth/hubspot/authorize');
    
    return response.authUrl;
  },

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Ignorar errores de logout del servidor
      console.warn('Error en logout del servidor:', error);
    }
  },

  /**
   * Refrescar token JWT
   */
  async refreshToken(refreshToken: string): Promise<string> {
    const response = await apiClient.post<{
      success: boolean;
      data: {
        accessToken: string;
      };
    }>('/auth/refresh-token', {
      refreshToken,
    });
    
    return response.data.accessToken;
  },

  /**
   * Verificar si el token es válido
   */
  async verifyToken(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Obtener URL de autorización de HubSpot
   */
  getHubSpotAuthUrl(): string {
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';
    return `${baseUrl}/auth/hubspot/authorize`;
  },

  /**
   * Redirigir a autenticación de HubSpot
   */
  redirectToHubSpotAuth(): void {
    window.location.href = this.getHubSpotAuthUrl();
  },
};
