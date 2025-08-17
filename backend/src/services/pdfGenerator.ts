import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';
import { logger } from '../config/logger';
import { createError } from '../middleware/errorHandler';

/**
 * Servicio para generar PDFs usando Gotenberg
 * Convierte HTML a PDF de alta calidad con opciones avanzadas
 */

interface PdfGenerationOptions {
  /**
   * Opciones de página
   */
  paperWidth?: number; // En pulgadas, default: 8.27 (A4)
  paperHeight?: number; // En pulgadas, default: 11.7 (A4)
  marginTop?: number; // En pulgadas, default: 0.39
  marginBottom?: number; // En pulgadas, default: 0.39
  marginLeft?: number; // En pulgadas, default: 0.39
  marginRight?: number; // En pulgadas, default: 0.39
  landscape?: boolean; // Orientación horizontal
  
  /**
   * Opciones de renderizado
   */
  printBackground?: boolean; // Imprimir fondos CSS
  scale?: number; // Factor de escala (0.1 - 2.0)
  preferCSSPageSize?: boolean; // Usar tamaño de página CSS
  
  /**
   * Opciones de espera
   */
  waitDelay?: string; // Tiempo de espera antes de imprimir (ej: "2s")
  waitForSelector?: string; // Esperar a que aparezca un selector CSS
  
  /**
   * Headers y footers
   */
  headerHtml?: string; // HTML para header
  footerHtml?: string; // HTML para footer
  
  /**
   * Metadatos del PDF
   */
  pdfTitle?: string;
  pdfAuthor?: string;
  pdfSubject?: string;
  pdfKeywords?: string;
}

interface PdfGenerationResult {
  buffer: Buffer;
  size: number;
  mimeType: string;
}

export class PdfGeneratorService {
  private axiosInstance: AxiosInstance;
  private readonly gotenbergUrl: string;

  constructor() {
    this.gotenbergUrl = process.env.GOTENBERG_URL || 'http://localhost:3001';
    
    this.axiosInstance = axios.create({
      baseURL: this.gotenbergUrl,
      timeout: 60000, // 60 segundos para generación de PDFs complejos
      responseType: 'arraybuffer', // Para recibir datos binarios
    });

    // Interceptor para logging
    this.axiosInstance.interceptors.request.use(
      (config) => {
        logger.debug('Gotenberg Request:', {
          method: config.method,
          url: config.url,
          timeout: config.timeout,
        });
        return config;
      }
    );

    this.axiosInstance.interceptors.response.use(
      (response) => {
        logger.debug('Gotenberg Response:', {
          status: response.status,
          contentType: response.headers['content-type'],
          contentLength: response.headers['content-length'],
        });
        return response;
      },
      (error) => {
        logger.error('Gotenberg Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data ? Buffer.from(error.response.data).toString() : 'No data',
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Verifica que Gotenberg esté disponible
   */
  async healthCheck(): Promise<boolean> {
    try {
      logger.info('Verificando conexión con Gotenberg...');
      
      const response = await axios.get(`${this.gotenbergUrl}/health`, {
        timeout: 5000,
      });
      
      const isHealthy = response.status === 200;
      
      logger.info('Estado de Gotenberg:', {
        isHealthy,
        status: response.status,
        url: this.gotenbergUrl,
      });
      
      return isHealthy;
    } catch (error: any) {
      logger.error('Gotenberg no disponible:', {
        error: error.message,
        url: this.gotenbergUrl,
      });
      return false;
    }
  }

  /**
   * Genera CSS base para documentos profesionales
   */
  private generateBaseCSS(): string {
    return `
      <style>
        * {
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Helvetica', 'Arial', sans-serif;
          font-size: 12px;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 20px;
          background-color: white;
        }
        
        h1, h2, h3, h4, h5, h6 {
          margin-top: 0;
          margin-bottom: 0.5em;
          font-weight: bold;
          color: #2c3e50;
        }
        
        h1 { font-size: 24px; margin-bottom: 1em; }
        h2 { font-size: 20px; margin-bottom: 0.8em; }
        h3 { font-size: 16px; margin-bottom: 0.6em; }
        
        p {
          margin: 0 0 1em 0;
        }
        
        strong, b {
          font-weight: bold;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 1em 0;
        }
        
        th, td {
          padding: 8px 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        
        th {
          background-color: #f8f9fa;
          font-weight: bold;
        }
        
        .header {
          text-align: center;
          margin-bottom: 2em;
          padding-bottom: 1em;
          border-bottom: 2px solid #3498db;
        }
        
        .footer {
          text-align: center;
          margin-top: 2em;
          padding-top: 1em;
          border-top: 1px solid #ddd;
          font-size: 10px;
          color: #666;
        }
        
        .signature-section {
          margin-top: 3em;
          padding-top: 2em;
        }
        
        .signature-line {
          border-bottom: 1px solid #333;
          width: 200px;
          margin-bottom: 0.5em;
        }
        
        @media print {
          body {
            padding: 0;
          }
          
          .no-print {
            display: none;
          }
        }
        
        @page {
          margin: 1in;
          size: A4;
        }
      </style>
    `;
  }

  /**
   * Genera HTML completo con CSS incluido
   */
  private generateCompleteHTML(content: string, options: PdfGenerationOptions = {}): string {
    const baseCSS = this.generateBaseCSS();
    const title = options.pdfTitle || 'Documento';
    
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        ${baseCSS}
      </head>
      <body>
        ${content}
        ${options.footerHtml ? `<div class="footer">${options.footerHtml}</div>` : ''}
      </body>
      </html>
    `;
  }

  /**
   * Genera PDF desde HTML usando Gotenberg
   */
  async generatePdfFromHtml(
    htmlContent: string,
    options: PdfGenerationOptions = {}
  ): Promise<PdfGenerationResult> {
    try {
      logger.info('Iniciando generación de PDF con Gotenberg:', {
        contentLength: htmlContent.length,
        options: {
          paperWidth: options.paperWidth,
          paperHeight: options.paperHeight,
          landscape: options.landscape,
          pdfTitle: options.pdfTitle,
        },
      });

      // Verificar que Gotenberg esté disponible
      const isHealthy = await this.healthCheck();
      if (!isHealthy) {
        throw createError('Servicio de generación de PDF no disponible', 503);
      }

      // Preparar HTML completo
      const completeHTML = this.generateCompleteHTML(htmlContent, options);

      // Crear FormData para la request
      const formData = new FormData();
      
      // Archivo HTML principal
      formData.append('files', Buffer.from(completeHTML, 'utf8'), {
        filename: 'index.html',
        contentType: 'text/html',
      });

      // Configurar opciones de página
      if (options.paperWidth) formData.append('paperWidth', options.paperWidth.toString());
      if (options.paperHeight) formData.append('paperHeight', options.paperHeight.toString());
      if (options.marginTop) formData.append('marginTop', options.marginTop.toString());
      if (options.marginBottom) formData.append('marginBottom', options.marginBottom.toString());
      if (options.marginLeft) formData.append('marginLeft', options.marginLeft.toString());
      if (options.marginRight) formData.append('marginRight', options.marginRight.toString());
      if (options.landscape) formData.append('landscape', 'true');

      // Configurar opciones de renderizado
      if (options.printBackground !== false) formData.append('printBackground', 'true');
      if (options.scale) formData.append('scale', options.scale.toString());
      if (options.preferCSSPageSize) formData.append('preferCSSPageSize', 'true');

      // Configurar esperas
      if (options.waitDelay) formData.append('waitDelay', options.waitDelay);
      if (options.waitForSelector) formData.append('waitForSelector', options.waitForSelector);

      // Configurar metadatos
      if (options.pdfTitle) formData.append('pdfTitle', options.pdfTitle);
      if (options.pdfAuthor) formData.append('pdfAuthor', options.pdfAuthor);
      if (options.pdfSubject) formData.append('pdfSubject', options.pdfSubject);
      if (options.pdfKeywords) formData.append('pdfKeywords', options.pdfKeywords);

      // Headers adicionales para Gotenberg
      const headers = {
        ...formData.getHeaders(),
        'Content-Type': 'multipart/form-data',
      };

      // Realizar request a Gotenberg
      const response = await this.axiosInstance.post(
        '/forms/chromium/convert/html',
        formData,
        { headers }
      );

      const pdfBuffer = Buffer.from(response.data);
      const result: PdfGenerationResult = {
        buffer: pdfBuffer,
        size: pdfBuffer.length,
        mimeType: 'application/pdf',
      };

      logger.info('PDF generado exitosamente:', {
        size: result.size,
        sizeKB: Math.round(result.size / 1024),
        contentLength: htmlContent.length,
      });

      return result;

    } catch (error: any) {
      logger.error('Error generando PDF:', {
        error: error.message,
        status: error.response?.status,
        gotenbergUrl: this.gotenbergUrl,
        contentLength: htmlContent.length,
      });

      if (error.response?.status === 400) {
        throw createError('Error en el contenido HTML para generar PDF', 400);
      } else if (error.response?.status === 503) {
        throw createError('Servicio de generación de PDF temporalmente no disponible', 503);
      } else {
        throw createError('Error interno generando PDF', 500);
      }
    }
  }

  /**
   * Genera PDF con opciones predeterminadas para documentos de negocio
   */
  async generateBusinessDocument(
    htmlContent: string,
    documentTitle: string,
    author?: string
  ): Promise<PdfGenerationResult> {
    const businessOptions: PdfGenerationOptions = {
      // Configuración A4
      paperWidth: 8.27,
      paperHeight: 11.7,
      
      // Márgenes profesionales
      marginTop: 1.0,
      marginBottom: 1.0,
      marginLeft: 0.8,
      marginRight: 0.8,
      
      // Opciones de renderizado
      printBackground: true,
      scale: 1.0,
      preferCSSPageSize: false,
      
      // Pequeña espera para renderizado completo
      waitDelay: '1s',
      
      // Metadatos
      pdfTitle: documentTitle,
      pdfAuthor: author || 'HubSpot PDF Generator',
      pdfSubject: 'Documento generado automáticamente',
      
      // Footer automático con fecha y página
      footerHtml: `
        <div style="text-align: center; font-size: 10px; color: #666;">
          Generado el ${new Date().toLocaleDateString('es-MX')} | Página <span class="pageNumber"></span> de <span class="totalPages"></span>
        </div>
      `,
    };

    return this.generatePdfFromHtml(htmlContent, businessOptions);
  }

  /**
   * Genera PDF con configuración para contratos
   */
  async generateContractDocument(
    htmlContent: string,
    contractTitle: string,
    clientName?: string
  ): Promise<PdfGenerationResult> {
    const contractOptions: PdfGenerationOptions = {
      // Configuración Legal (Letter size)
      paperWidth: 8.5,
      paperHeight: 11.0,
      
      // Márgenes amplios para legal
      marginTop: 1.2,
      marginBottom: 1.2,
      marginLeft: 1.0,
      marginRight: 1.0,
      
      printBackground: true,
      scale: 0.95, // Ligeramente más pequeño para mejor legibilidad
      
      // Espera más larga para contenido complejo
      waitDelay: '2s',
      
      pdfTitle: contractTitle,
      pdfAuthor: 'Sistema de Contratos',
      pdfSubject: `Contrato - ${clientName || 'Cliente'}`,
      pdfKeywords: 'contrato,legal,servicios',
    };

    return this.generatePdfFromHtml(htmlContent, contractOptions);
  }
}

// Singleton instance
export const pdfGeneratorService = new PdfGeneratorService();
