import { Request, Response } from 'express';
import { WebhookService } from '../services/webhook.service';

export class TestController {
  /**
   * Test ad detection
   * POST /api/test/ad-detection
   */
  async testAdDetection(req: Request, res: Response) {
    try {
      const evolutionMessage = req.body;
      const webhookService = WebhookService.getInstance();

      // Transform message
      const payload = webhookService.transformMessage(evolutionMessage, 'TEST-UUID');

      return res.json({
        success: true,
        payload,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}
