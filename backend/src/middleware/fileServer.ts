import { Request, Response, NextFunction } from 'express';
import { fileStorageService } from '../services/fileStorage';
import { logger } from '../config/logger';
import { createError } from './errorHandler';

/**
 * Middleware para servir archivos estáticos con control de acceso
 * Verifica permisos de tenant antes de servir archivos
 */

/**
 * Middleware para servir archivos PDF con control de acceso por tenant
 */
export const serveProtectedFile = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const filePath = req.params[0]; // Captura toda la ruta después de /files/
    
    if (!filePath) {
      return res.status(400).json({
        success: false,
        message: 'Ruta de archivo requerida',
      });
    }

    logger.debug('Solicitud de archivo protegido:', {
      filePath,
      userTenantId: req.user?.tenantId,
      ip: req.ip,
    });

    // Extraer tenant ID del path del archivo (formato: documents/tenantId/...)
    const pathParts = filePath.split('/');
    if (pathParts.length < 2 || pathParts[0] !== 'documents') {
      return res.status(400).json({
        success: false,
        message: 'Ruta de archivo inválida',
      });
    }

    const fileOwnerTenantId = pathParts[1];

    // Verificar que el usuario tiene acceso al archivo (mismo tenant)
    if (!req.user || req.user.tenantId !== fileOwnerTenantId) {
      logger.warn('Intento de acceso no autorizado a archivo:', {
        filePath,
        requestedTenantId: fileOwnerTenantId,
        userTenantId: req.user?.tenantId,
        userId: req.user?.id,
        ip: req.ip,
      });
      
      return res.status(403).json({
        success: false,
        message: 'No autorizado para acceder a este archivo',
      });
    }

    // Obtener información del archivo
    const fileInfo = await fileStorageService.getFileInfo(filePath);
    
    if (!fileInfo.exists) {
      logger.warn('Archivo solicitado no existe:', {
        filePath,
        tenantId: req.user.tenantId,
        userId: req.user.id,
      });
      
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado',
      });
    }

    // Leer archivo
    const fileBuffer = await fileStorageService.readFile(filePath);
    
    // Determinar tipo de contenido
    const contentType = filePath.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream';
    
    // Configurar headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', fileBuffer.length);
    res.setHeader('Cache-Control', 'private, max-age=3600'); // Cache por 1 hora
    res.setHeader('Last-Modified', fileInfo.modifiedAt?.toUTCString() || new Date().toUTCString());
    
    // Para PDFs, permitir visualización en navegador
    if (contentType === 'application/pdf') {
      res.setHeader('Content-Disposition', 'inline');
    }

    logger.info('Sirviendo archivo protegido:', {
      filePath,
      fileSize: fileBuffer.length,
      contentType,
      tenantId: req.user.tenantId,
      userId: req.user.id,
    });

    // Enviar archivo
    res.send(fileBuffer);

  } catch (error: any) {
    logger.error('Error sirviendo archivo protegido:', {
      filePath: req.params[0],
      error: error.message,
      tenantId: req.user?.tenantId,
      userId: req.user?.id,
    });

    if (error.statusCode === 404) {
      res.status(404).json({
        success: false,
        message: 'Archivo no encontrado',
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error accediendo al archivo',
      });
    }
  }
};

/**
 * Middleware para servir archivos públicos (sin autenticación)
 * Usar solo para assets que no requieren protección
 */
export const servePublicFile = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const filePath = req.params[0];
    
    if (!filePath) {
      return res.status(400).json({
        success: false,
        message: 'Ruta de archivo requerida',
      });
    }

    // Solo permitir ciertos tipos de archivos públicos
    const allowedExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.ico'];
    const hasAllowedExtension = allowedExtensions.some(ext => filePath.toLowerCase().endsWith(ext));
    
    if (!hasAllowedExtension) {
      return res.status(403).json({
        success: false,
        message: 'Tipo de archivo no permitido',
      });
    }

    const publicPath = `public/${filePath}`;
    const fileInfo = await fileStorageService.getFileInfo(publicPath);
    
    if (!fileInfo.exists) {
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado',
      });
    }

    const fileBuffer = await fileStorageService.readFile(publicPath);
    
    // Determinar content type
    let contentType = 'application/octet-stream';
    if (filePath.endsWith('.css')) contentType = 'text/css';
    else if (filePath.endsWith('.js')) contentType = 'application/javascript';
    else if (filePath.endsWith('.png')) contentType = 'image/png';
    else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) contentType = 'image/jpeg';
    else if (filePath.endsWith('.gif')) contentType = 'image/gif';
    else if (filePath.endsWith('.ico')) contentType = 'image/x-icon';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', fileBuffer.length);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache público por 24 horas
    
    if (fileInfo.modifiedAt) {
      res.setHeader('Last-Modified', fileInfo.modifiedAt.toUTCString());
    }

    logger.debug('Sirviendo archivo público:', {
      filePath,
      fileSize: fileBuffer.length,
      contentType,
    });

    res.send(fileBuffer);

  } catch (error: any) {
    logger.error('Error sirviendo archivo público:', {
      filePath: req.params[0],
      error: error.message,
    });

    res.status(500).json({
      success: false,
      message: 'Error accediendo al archivo',
    });
  }
};
