import { Request, Response } from 'express';
import { EvolutionService } from '../services/evolution.service';

export class InstanceController {
  constructor(private evolutionService: EvolutionService) {}

  /**
   * @swagger
   * /api/instance/status:
   *   get:
   *     summary: Get instance connection status
   *     tags: [Instance]
   *     responses:
   *       200:
   *         description: Instance status retrieved
   */
  async getStatus(req: Request, res: Response) {
    try {
      const result = await this.evolutionService.getInstanceStatus();

      return res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to get instance status',
      });
    }
  }

  /**
   * @swagger
   * /api/chats:
   *   get:
   *     summary: Get all chats
   *     tags: [Chats]
   *     responses:
   *       200:
   *         description: Chats retrieved successfully
   */
  async getChats(req: Request, res: Response) {
    try {
      const result = await this.evolutionService.getChats();

      return res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to get chats',
      });
    }
  }

  /**
   * @swagger
   * /api/messages/{phone}:
   *   get:
   *     summary: Get messages for a specific chat
   *     tags: [Chats]
   *     parameters:
   *       - in: path
   *         name: phone
   *         required: true
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 50
   *     responses:
   *       200:
   *         description: Messages retrieved successfully
   */
  async getMessages(req: Request, res: Response) {
    try {
      const { phone } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;

      if (!phone) {
        return res.status(400).json({
          success: false,
          error: 'Phone number is required',
        });
      }

      const result = await this.evolutionService.getChatMessages(phone, limit);

      return res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to get messages',
      });
    }
  }
}
