import { Router } from 'express';
import { 
  initiateHubSpotAuth, 
  hubspotCallback, 
  login, 
  logout, 
  getCurrentUser, 
  refreshToken 
} from '../controllers/auth';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// === Rutas de OAuth2 con HubSpot ===

/**
 * GET /api/auth/hubspot/authorize
 * Iniciar proceso de autorización con HubSpot
 */
router.get('/hubspot/authorize', initiateHubSpotAuth);

/**
 * GET /api/auth/hubspot/callback
 * Callback de OAuth2 de HubSpot
 */
router.get('/hubspot/callback', hubspotCallback);

// === Rutas de autenticación tradicional ===

/**
 * POST /api/auth/login
 * Iniciar sesión (alternativo a OAuth2)
 */
router.post('/login', login);

/**
 * POST /api/auth/refresh-token
 * Refrescar token JWT
 */
router.post('/refresh-token', refreshToken);

// === Rutas protegidas (requieren autenticación) ===

/**
 * GET /api/auth/me
 * Obtener información del usuario autenticado
 */
router.get('/me', authMiddleware, getCurrentUser);

/**
 * POST /api/auth/logout
 * Cerrar sesión del usuario
 */
router.post('/logout', authMiddleware, logout);

export default router;
