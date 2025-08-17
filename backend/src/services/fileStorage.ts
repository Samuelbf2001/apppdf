import fs from 'fs/promises';
import path from 'path';
import { logger } from '../config/logger';
import { createError } from '../middleware/errorHandler';

/**
 * Servicio para gestión de archivos locales y almacenamiento
 * Maneja guardado, lectura y limpieza de archivos PDF generados
 */

interface SaveFileOptions {
  tenantId: string;
  documentId: string;
  fileName: string;
  buffer: Buffer;
  mimeType: string;
}

interface SaveFileResult {
  filePath: string;
  fileName: string;
  fileUrl: string;
  size: number;
}

export class FileStorageService {
  private readonly baseStoragePath: string;
  private readonly baseUrl: string;

  constructor() {
    this.baseStoragePath = process.env.STORAGE_PATH || path.join(process.cwd(), 'storage');
    this.baseUrl = process.env.FILE_BASE_URL || 'http://localhost:3001/files';
  }

  /**
   * Inicializa directorios de almacenamiento
   */
  async initializeStorage(): Promise<void> {
    try {
      logger.info('Inicializando sistema de archivos:', {
        baseStoragePath: this.baseStoragePath,
      });

      // Crear directorio base si no existe
      await this.ensureDirectoryExists(this.baseStoragePath);
      
      // Crear subdirectorios principales
      await this.ensureDirectoryExists(path.join(this.baseStoragePath, 'documents'));
      await this.ensureDirectoryExists(path.join(this.baseStoragePath, 'temp'));
      
      logger.info('Sistema de archivos inicializado correctamente');
    } catch (error) {
      logger.error('Error inicializando sistema de archivos:', error);
      throw createError('Error inicializando almacenamiento de archivos', 500);
    }
  }

  /**
   * Asegura que un directorio existe, lo crea si es necesario
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
      logger.debug('Directorio existe:', { path: dirPath });
    } catch (error) {
      logger.info('Creando directorio:', { path: dirPath });
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * Genera path relativo para un archivo basado en tenant y documento
   */
  private generateFilePath(tenantId: string, documentId: string, fileName: string): string {
    // Organizar por tenant/año/mes para mejor organización
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    const relativePath = path.join(
      'documents',
      tenantId,
      year.toString(),
      month,
      `${documentId}_${fileName}`
    );
    
    return relativePath;
  }

  /**
   * Guarda un archivo PDF en el sistema de archivos
   */
  async saveFile(options: SaveFileOptions): Promise<SaveFileResult> {
    try {
      logger.info('Guardando archivo:', {
        tenantId: options.tenantId,
        documentId: options.documentId,
        fileName: options.fileName,
        size: options.buffer.length,
      });

      // Generar path del archivo
      const relativePath = this.generateFilePath(
        options.tenantId,
        options.documentId,
        options.fileName
      );
      
      const fullPath = path.join(this.baseStoragePath, relativePath);
      const directory = path.dirname(fullPath);

      // Asegurar que el directorio existe
      await this.ensureDirectoryExists(directory);

      // Guardar archivo
      await fs.writeFile(fullPath, options.buffer);

      // Generar URL pública
      const fileUrl = `${this.baseUrl}/${relativePath.replace(/\\/g, '/')}`;

      const result: SaveFileResult = {
        filePath: relativePath,
        fileName: options.fileName,
        fileUrl,
        size: options.buffer.length,
      };

      logger.info('Archivo guardado exitosamente:', {
        filePath: result.filePath,
        fileUrl: result.fileUrl,
        size: result.size,
      });

      return result;

    } catch (error: any) {
      logger.error('Error guardando archivo:', {
        error: error.message,
        tenantId: options.tenantId,
        documentId: options.documentId,
      });
      throw createError('Error guardando archivo', 500);
    }
  }

  /**
   * Lee un archivo desde el almacenamiento
   */
  async readFile(filePath: string): Promise<Buffer> {
    try {
      logger.debug('Leyendo archivo:', { filePath });
      
      const fullPath = path.join(this.baseStoragePath, filePath);
      
      // Verificar que el archivo existe
      try {
        await fs.access(fullPath);
      } catch (error) {
        logger.warn('Archivo no encontrado:', { filePath });
        throw createError('Archivo no encontrado', 404);
      }

      const buffer = await fs.readFile(fullPath);
      
      logger.debug('Archivo leído exitosamente:', {
        filePath,
        size: buffer.length,
      });

      return buffer;
    } catch (error: any) {
      if (error.statusCode === 404) {
        throw error;
      }
      
      logger.error('Error leyendo archivo:', {
        error: error.message,
        filePath,
      });
      throw createError('Error accediendo al archivo', 500);
    }
  }

  /**
   * Elimina un archivo del almacenamiento
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      logger.info('Eliminando archivo:', { filePath });
      
      const fullPath = path.join(this.baseStoragePath, filePath);
      
      // Verificar que el archivo existe antes de eliminarlo
      try {
        await fs.access(fullPath);
      } catch (error) {
        logger.warn('Intento de eliminar archivo que no existe:', { filePath });
        return; // No es error si no existe
      }

      await fs.unlink(fullPath);
      
      logger.info('Archivo eliminado exitosamente:', { filePath });
    } catch (error: any) {
      logger.error('Error eliminando archivo:', {
        error: error.message,
        filePath,
      });
      throw createError('Error eliminando archivo', 500);
    }
  }

  /**
   * Obtiene información de un archivo
   */
  async getFileInfo(filePath: string): Promise<{
    exists: boolean;
    size?: number;
    createdAt?: Date;
    modifiedAt?: Date;
  }> {
    try {
      const fullPath = path.join(this.baseStoragePath, filePath);
      
      try {
        const stats = await fs.stat(fullPath);
        return {
          exists: true,
          size: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime,
        };
      } catch (error) {
        return { exists: false };
      }
    } catch (error: any) {
      logger.error('Error obteniendo información de archivo:', {
        error: error.message,
        filePath,
      });
      return { exists: false };
    }
  }

  /**
   * Limpia archivos temporales antiguos
   */
  async cleanupOldFiles(maxAgeHours: number = 24): Promise<number> {
    try {
      logger.info('Iniciando limpieza de archivos temporales:', {
        maxAgeHours,
      });

      const tempDir = path.join(this.baseStoragePath, 'temp');
      let cleanedCount = 0;

      try {
        const files = await fs.readdir(tempDir);
        const cutoffTime = Date.now() - (maxAgeHours * 60 * 60 * 1000);

        for (const file of files) {
          const filePath = path.join(tempDir, file);
          const stats = await fs.stat(filePath);

          if (stats.mtime.getTime() < cutoffTime) {
            await fs.unlink(filePath);
            cleanedCount++;
            logger.debug('Archivo temporal eliminado:', { file });
          }
        }
      } catch (error) {
        logger.warn('Directorio temporal no existe o está vacío');
      }

      logger.info('Limpieza de archivos completada:', {
        cleanedCount,
        maxAgeHours,
      });

      return cleanedCount;
    } catch (error: any) {
      logger.error('Error en limpieza de archivos:', {
        error: error.message,
        maxAgeHours,
      });
      return 0;
    }
  }

  /**
   * Genera nombre único para archivo
   */
  generateUniqueFileName(originalName: string, extension: string = 'pdf'): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const randomSuffix = Math.random().toString(36).substring(7);
    const baseName = originalName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
    
    return `${baseName}_${timestamp}_${randomSuffix}.${extension}`;
  }
}

// Singleton instance
export const fileStorageService = new FileStorageService();
