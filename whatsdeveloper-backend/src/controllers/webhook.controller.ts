import { Request, Response } from 'express';
import { WebhookService } from '../services/webhook.service';

export class WebhookController {
  constructor(private webhookService: WebhookService) {}

  /**
   * Register webhook URL
   * POST /api/webhook/register
   */
  async registerWebhook(req: Request, res: Response) {
    try {
      const { url, enabled = true } = req.body;
      const uuid = (req as any).deviceUuid || 'default';

      if (!url) {
        return res.status(400).json({
          success: false,
          error: 'Missing required field: url',
        });
      }

      // Validate URL format
      try {
        new URL(url);
      } catch {
        return res.status(400).json({
          success: false,
          error: 'Invalid URL format',
        });
      }

      this.webhookService.registerWebhook(uuid, url, enabled);

      return res.json({
        success: true,
        message: 'Webhook registered successfully',
        uuid,
        url,
        enabled,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to register webhook',
      });
    }
  }

  /**
   * Get webhook config
   * GET /api/webhook/config
   */
  async getWebhookConfig(req: Request, res: Response) {
    try {
      const uuid = (req as any).deviceUuid || 'default';
      const config = this.webhookService.getWebhook(uuid);

      if (!config) {
        return res.status(404).json({
          success: false,
          error: 'No webhook configured for this device',
        });
      }

      return res.json({
        success: true,
        uuid,
        url: config.url,
        enabled: config.enabled,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to get webhook config',
      });
    }
  }

  /**
   * Receive incoming message from Evolution API
   * POST /api/webhook/incoming
   */
  async handleIncoming(req: Request, res: Response) {
    try {
      const evolutionMessage = req.body;

      // Try to get UUID from multiple sources
      const uuid =
        (req as any).deviceUuid ||
        req.headers['x-device-uuid'] ||
        req.body.uuid ||
        'default';

      // Transform Evolution message to WhatsDeveloper format
      const payload = this.webhookService.transformMessage(evolutionMessage, uuid as string);

      // Send to registered webhook
      const sent = await this.webhookService.sendWebhook(uuid as string, payload);

      return res.json({
        success: sent,
        message: sent ? 'Webhook sent successfully' : 'No active webhook configured',
        uuid,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to process incoming message',
      });
    }
  }

  /**
   * Test webhook
   * POST /api/webhook/test
   */
  async testWebhook(req: Request, res: Response) {
    try {
      const uuid = (req as any).deviceUuid || 'default';

      // Create test payload
      const testPayload = {
        uuid,
        event: 'message.received',
        timestamp: Date.now(),
        data: {
          from: '201234567890@s.whatsapp.net',
          fromName: 'Test User',
          to: '201111111111@s.whatsapp.net',
          message: {
            type: 'text',
            body: 'This is a test message from WhatsDeveloper Backend',
          },
          messageId: 'TEST_' + Date.now(),
          isGroup: false,
        },
      };

      const sent = await this.webhookService.sendWebhook(uuid, testPayload);

      if (!sent) {
        return res.status(404).json({
          success: false,
          error: 'No active webhook configured',
        });
      }

      return res.json({
        success: true,
        message: 'Test webhook sent successfully',
        payload: testPayload,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to send test webhook',
      });
    }
  }
}
