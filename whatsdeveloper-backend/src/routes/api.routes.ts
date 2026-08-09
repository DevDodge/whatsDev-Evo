import { Router } from 'express';
import { MessageController } from '../controllers/message.controller';
import { InstanceController } from '../controllers/instance.controller';
import { SequenceController } from '../controllers/sequence.controller';
import { WebhookController } from '../controllers/webhook.controller';
import { TestController } from '../controllers/test.controller';
import { EvolutionService } from '../services/evolution.service';

export function createRouter(
  messageController: MessageController,
  instanceController: InstanceController,
  sequenceController: SequenceController,
  webhookController: WebhookController,
  testController: TestController,
  authMiddleware: any,
): Router {
  const router = Router();

  // Message routes (matching WhatsDeveloper API)
  router.post('/api/send-message', (req, res) => messageController.sendMessage(req, res));
  router.post('/api/send-image', (req, res) => messageController.sendImage(req, res));
  router.post('/api/send-video', (req, res) => messageController.sendVideo(req, res));
  router.post('/api/send-audio', (req, res) => messageController.sendAudio(req, res));
  router.post('/api/send-document', (req, res) => messageController.sendDocument(req, res));
  router.post('/api/send-location', (req, res) => messageController.sendLocation(req, res));
  router.post('/api/send-contact', (req, res) => messageController.sendContact(req, res));
  router.post('/api/send-buttons', (req, res) => messageController.sendButtons(req, res));

  // n8n compatibility routes - /api/v1/messages/* endpoints
  router.post('/api/v1/messages/send-text', (req, res) => messageController.sendText(req, res));
  router.post('/api/v1/messages/send-message', (req, res) => messageController.sendMessage(req, res));
  router.post('/api/v1/messages/send-image', (req, res) => messageController.sendImage(req, res));
  router.post('/api/v1/messages/send-video', (req, res) => messageController.sendVideo(req, res));
  router.post('/api/v1/messages/send-audio', (req, res) => messageController.sendAudio(req, res));
  router.post('/api/v1/messages/send-document', (req, res) => messageController.sendDocument(req, res));

  // Sequence route (with auth middleware)
  router.post('/api/v1/messages/send-sequence', authMiddleware, (req, res) =>
    sequenceController.sendSequence(req, res),
  );

  // Webhook routes (with auth middleware)
  router.post('/api/webhook/register', authMiddleware, (req, res) => webhookController.registerWebhook(req, res));
  router.post('/api/webhook/register/:instanceId', authMiddleware, (req, res) => webhookController.registerWebhook(req, res));
  router.post('/api/webhook/smart-register/:instanceId', (req, res) => webhookController.smartRegister(req, res)); // No auth - called by Evolution Manager
  router.get('/api/webhook/config', authMiddleware, (req, res) => webhookController.getWebhookConfig(req, res));
  router.get('/api/webhook/config/:instanceId', authMiddleware, (req, res) => webhookController.getWebhookConfig(req, res));
  router.get('/api/webhook/status', (req, res) => webhookController.getWebhookStatus(req, res)); // Public endpoint
  router.post('/api/webhook/test', authMiddleware, (req, res) => webhookController.testWebhook(req, res));
  router.post('/api/webhook/incoming', (req, res) => webhookController.handleIncoming(req, res)); // No auth - called by Evolution
  router.post('/api/webhook/incoming/:instanceId', (req, res) => webhookController.handleIncoming(req, res)); // With instance ID

  // Test routes (for development)
  router.post('/api/test/ad-detection', (req, res) => testController.testAdDetection(req, res));

  // Instance & Chat routes
  router.get('/api/instance/status', (req, res) => instanceController.getStatus(req, res));
  router.get('/api/chats', (req, res) => instanceController.getChats(req, res));
  router.get('/api/messages/:phone', (req, res) => instanceController.getMessages(req, res));

  // Health check
  router.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'WhatsDeveloper Backend Bridge',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  return router;
}
