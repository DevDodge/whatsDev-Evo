import { Request, Response } from 'express';
import { WebhookService } from '../services/webhook.service';

export class WebhookController {
  constructor(private webhookService: WebhookService) {}

  /**
   * Register webhook URL
   * POST /api/webhook/register
   * POST /api/webhook/register/:instanceId
   */
  async registerWebhook(req: Request, res: Response) {
    try {
      const { url, enabled = true } = req.body;
      const instanceId = req.params.instanceId || (req as any).deviceUuid || req.body.instanceId || 'default';

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

      this.webhookService.registerWebhook(instanceId, url, enabled);

      return res.json({
        success: true,
        message: 'Webhook registered successfully',
        instanceId,
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
   * GET /api/webhook/config/:instanceId
   */
  async getWebhookConfig(req: Request, res: Response) {
    try {
      const instanceId = req.params.instanceId || (req as any).deviceUuid || req.query.instanceId || 'default';
      const config = this.webhookService.getWebhook(instanceId as string);

      if (!config) {
        return res.status(404).json({
          success: false,
          error: 'No webhook configured for this instance',
          instanceId,
        });
      }

      return res.json({
        success: true,
        instanceId,
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
   * OR
   * POST /api/webhook/incoming/:instanceId
   */
  async handleIncoming(req: Request, res: Response) {
    try {
      const rawPayload = req.body;

      // Extract the actual message data from Evolution wrapper
      // Evolution sends: { event, instance, data: { key, message, ... } }
      // We need just the data part
      const evolutionMessage = rawPayload.data || rawPayload;

      // Try to get instance ID from multiple sources
      const instanceId =
        req.params.instanceId ||              // From URL param
        (req as any).deviceUuid ||
        req.headers['x-device-uuid'] ||
        rawPayload.instance ||                // From Evolution payload
        rawPayload.data?.instanceId ||
        req.body.uuid ||
        'default';

      console.log(`[Webhook] Received message for instance: ${instanceId}`);

      // Transform Evolution message to WhatsDeveloper format
      const payload = this.webhookService.transformMessage(evolutionMessage, instanceId as string);

      // Send to registered webhook for this instance
      const sent = await this.webhookService.sendWebhook(instanceId as string, payload);

      return res.json({
        success: sent,
        message: sent ? 'Webhook sent successfully' : 'No active webhook configured',
        instanceId,
        evolutionEvent: rawPayload.event || 'unknown',
      });
    } catch (error: any) {
      console.error('[Webhook] handleIncoming error:', error);
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

  /**
   * Get webhook auto-configuration status
   * GET /api/webhook/status
   */
  async getWebhookStatus(req: Request, res: Response) {
    try {
      // Get auto-config service (if available)
      const { AutoConfigService } = await import('../services/auto-config.service');

      const evolutionApiUrl = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
      const evolutionApiKey = process.env.EVOLUTION_API_KEY || '';
      const instanceName = process.env.DEFAULT_INSTANCE_NAME || 'TEST';
      const backendPublicUrl = process.env.BACKEND_PUBLIC_URL || '';
      const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || '';

      const autoConfig = new AutoConfigService({
        evolutionApiUrl,
        evolutionApiKey,
        instanceName,
        backendPublicUrl,
        n8nWebhookUrl,
      });

      const status = await autoConfig.getStatus();

      return res.json({
        success: true,
        autoConfigEnabled: process.env.AUTO_CONFIGURE_WEBHOOKS === 'true',
        instanceName,
        status,
        flow: status.backend.configured && status.evolution.configured
          ? 'WhatsApp → Evolution → Backend → n8n ✅'
          : 'Configuration incomplete ⚠️',
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to get webhook status',
      });
    }
  }

  /**
   * Smart Webhook Registration with Auto-Interception
   * POST /api/webhook/smart-register/:instanceId
   *
   * This endpoint:
   * 1. Registers n8n URL in Backend
   * 2. Automatically configures Evolution to send to Backend
   */
  async smartRegister(req: Request, res: Response) {
    try {
      const { url, enabled = true } = req.body;
      const instanceId = req.params.instanceId || (req as any).deviceUuid || req.body.instanceId;

      if (!instanceId) {
        return res.status(400).json({
          success: false,
          error: 'Missing instance ID',
        });
      }

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

      console.log(`[Smart Register] Instance: ${instanceId}, n8n URL: ${url}`);

      // Step 1: Register n8n webhook in Backend
      this.webhookService.registerWebhook(instanceId, url, enabled);
      console.log(`[Smart Register] ✓ Registered n8n webhook in Backend`);

      // Step 2: Configure Evolution to send to Backend
      const backendPublicUrl = process.env.BACKEND_PUBLIC_URL || 'http://localhost:55453';
      const backendWebhookUrl = `${backendPublicUrl}/api/webhook/incoming/${instanceId}`;

      const evolutionApiUrl = process.env.EVOLUTION_API_URL || 'http://localhost:2345';
      const evolutionApiKey = process.env.EVOLUTION_API_KEY || '';

      try {
        const axios = await import('axios');
        await axios.default.post(
          `${evolutionApiUrl}/webhook/set/${instanceId}`,
          {
            webhook: {
              enabled: true,
              url: backendWebhookUrl,
              events: ['MESSAGES_UPSERT'],
              webhookByEvents: false,
              webhookBase64: false,
            },
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'apikey': evolutionApiKey,
            },
          }
        );
        console.log(`[Smart Register] ✓ Evolution configured to send to Backend`);
      } catch (error: any) {
        console.error(`[Smart Register] Failed to configure Evolution:`, error.message);
        return res.status(500).json({
          success: false,
          error: 'Registered n8n webhook but failed to configure Evolution. Please configure manually.',
          instanceId,
          n8nUrl: url,
          backendUrl: backendWebhookUrl,
        });
      }

      return res.json({
        success: true,
        message: 'Smart webhook registration successful',
        instanceId,
        n8nUrl: url,
        backendUrl: backendWebhookUrl,
        evolutionConfigured: true,
        flow: 'WhatsApp → Evolution → Backend → n8n ✅',
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to register smart webhook',
      });
    }
  }
}
