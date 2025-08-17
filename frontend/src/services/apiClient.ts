import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Cliente HTTP configurado para la API
 * Maneja autenticación, interceptors y configuración base
 */

class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - agregar token de autenticación
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Log de requests en desarrollo
        if (process.env.NODE_ENV === 'development') {
          console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
            params: config.params,
            data: config.data,
          });
        }
        
        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor - manejo de errores globales
    this.client.interceptors.response.use(
      (response) => {
        // Log de responses exitosas en desarrollo
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
            status: response.status,
            data: response.data,
          });
        }
        
        return response;
      },
      (error) => {
        const originalRequest = error.config;

        // Log de errores
        console.error('❌ API Error:', {
          method: originalRequest?.method?.toUpperCase(),
          url: originalRequest?.url,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        });

        // Manejar error 401 (no autorizado)
        if (error.response?.status === 401) {
          // Solo redirigir al login si no estamos ya en una página de auth
          const currentPath = window.location.pathname;
          if (!currentPath.startsWith('/auth')) {
            localStorage.removeItem('auth_token');
            window.location.href = '/auth/login';
          }
        }

        // Extraer mensaje de error del response
        const errorMessage = error.response?.data?.message || 
                           error.response?.data?.error || 
                           error.message || 
                           'Error de conexión';

        // Crear error normalizado
        const normalizedError = {
          message: errorMessage,
          status: error.response?.status,
          validationErrors: error.response?.data?.validationErrors,
          originalError: error,
        };

        return Promise.reject(normalizedError);
      }
    );
  }

  // Métodos HTTP básicos
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  // Método para requests con archivos
  async uploadFile<T = any>(
    url: string, 
    file: File, 
    data?: Record<string, any>,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Agregar datos adicionales al FormData
    if (data) {
      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });
    }

    const response = await this.client.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  }

  // Método para descargar archivos
  async downloadFile(url: string, fileName?: string): Promise<void> {
    const response = await this.client.get(url, {
      responseType: 'blob',
    });

    // Crear URL del blob y descargar
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Limpiar URL del blob
    window.URL.revokeObjectURL(downloadUrl);
  }

  // Obtener URL base
  getBaseURL(): string {
    return this.baseURL;
  }

  // Obtener cliente Axios raw (para casos especiales)
  getRawClient(): AxiosInstance {
    return this.client;
  }
}

// Crear instancia singleton
const apiClient = new ApiClient(
  process.env.REACT_APP_API_URL || 'http://localhost:3002/api'
);

export default apiClient;
