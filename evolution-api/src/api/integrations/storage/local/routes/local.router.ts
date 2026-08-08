import { ConfigService } from '@config/env.config';
import { Logger } from '@config/logger.config';
import { RequestHandler, Router } from 'express';
import { existsSync } from 'fs';
import { join, resolve } from 'path';

const logger = new Logger('LocalStorageRouter');

export function localRouter(config: ConfigService): Router {
  const router = Router();

  const localStorageConfig = config.get('LOCAL_STORAGE');

  if (!localStorageConfig?.ENABLED) {
    logger.warn('Local storage is disabled');
    return router;
  }

  // Resolve to absolute path for security checks
  const basePath = resolve(localStorageConfig.PATH);

  /**
   * GET /media/:type/:date?/:filename
   * Serve media files from local storage
   */
  const serveMedia: RequestHandler = (req, res) => {
    try {
      const { type, date, filename } = req.params;
      const restPath = req.params[0]; // Catch-all for nested paths

      // Build file path
      let filePath: string;

      if (restPath) {
        // Handle nested paths like /media/images/2026-08/abc.jpg
        filePath = resolve(join(basePath, restPath));
      } else if (date && filename) {
        // Handle /media/:type/:date/:filename
        filePath = resolve(join(basePath, type, date, filename));
      } else if (type && !date) {
        // Handle /media/:type/:filename (no date folder)
        filePath = resolve(join(basePath, type));
      } else {
        return res.status(400).json({ error: 'Invalid media path' });
      }

      // Security: prevent directory traversal
      if (!filePath.startsWith(basePath)) {
        logger.warn(`Directory traversal attempt: ${filePath}`);
        return res.status(403).json({ error: 'Forbidden' });
      }

      // Check if file exists
      if (!existsSync(filePath)) {
        logger.warn(`Media not found: ${filePath}`);
        return res.status(404).json({ error: 'Media not found' });
      }

      // Serve file
      res.sendFile(filePath, (err) => {
        if (err) {
          logger.error(`Error serving media: ${err.message}`);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to serve media' });
          }
        }
      });
    } catch (error) {
      logger.error(`Error in serveMedia: ${error.message}`);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  // Register routes
  router.get('/media/*', serveMedia); // Catch-all for any nested structure

  logger.log('Local storage routes registered');

  return router;
}
