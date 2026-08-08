import { Request, Response, NextFunction } from 'express';
import { EvolutionService } from '../services/evolution.service';

/**
 * Authentication middleware
 * Extracts Evolution API key from X-API-Token header
 * and validates instance availability
 */
export function createAuthMiddleware(getEvolutionService: (apiKey: string) => EvolutionService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Extract API token from headers
      const apiToken =
        req.headers['x-api-token'] || req.headers['authorization']?.replace('Bearer ', '') || req.query.apikey;

      // UUID is accepted but not used (for backward compatibility)
      const deviceUuid = req.headers['x-device-uuid'] || 'default';

      if (!apiToken) {
        return res.status(401).json({
          success: false,
          error: 'Missing authentication token. Provide X-API-Token header or Authorization: Bearer token',
        });
      }

      // Store API token and UUID in request for controllers to use
      (req as any).apiToken = apiToken as string;
      (req as any).deviceUuid = deviceUuid as string;

      // Validate instance availability (optional check)
      // You can enable this if you want to check before each request
      // const evolutionService = getEvolutionService(apiToken as string);
      // const isAvailable = await evolutionService.isInstanceAvailable();
      // if (!isAvailable) {
      //   return res.status(503).json({
      //     success: false,
      //     error: 'WhatsApp instance not available',
      //   });
      // }

      next();
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Authentication failed',
      });
    }
  };
}

/**
 * Optional middleware: Log device UUID for analytics
 */
export function logDeviceUuid(req: Request, res: Response, next: NextFunction) {
  const uuid = req.headers['x-device-uuid'];
  if (uuid) {
    console.log(`[Device UUID] ${uuid} - ${req.method} ${req.path}`);
  }
  next();
}
