import { Request, Response } from 'express';
import { EvolutionService } from '../services/evolution.service';

export class MessageController {
  constructor(private evolutionService: EvolutionService) {}

  /**
   * @swagger
   * /api/send-message:
   *   post:
   *     summary: Send text message
   *     tags: [Messages]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - phone
   *               - message
   *             properties:
   *               phone:
   *                 type: string
   *                 example: "201234567890"
   *               message:
   *                 type: string
   *                 example: "Hello from WhatsDeveloper"
   *     responses:
   *       200:
   *         description: Message sent successfully
   */
  async sendMessage(req: Request, res: Response) {
    try {
      const { phone, message } = req.body;

      if (!phone || !message) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: phone, message',
        });
      }

      const result = await this.evolutionService.sendText(phone, message);

      return res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to send message',
      });
    }
  }

  /**
   * @swagger
   * /api/send-image:
   *   post:
   *     summary: Send image message
   *     tags: [Messages]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - phone
   *               - image
   *             properties:
   *               phone:
   *                 type: string
   *               image:
   *                 type: string
   *                 description: Image URL
   *               caption:
   *                 type: string
   *     responses:
   *       200:
   *         description: Image sent successfully
   */
  async sendImage(req: Request, res: Response) {
    try {
      const { phone, image, caption } = req.body;

      if (!phone || !image) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: phone, image',
        });
      }

      const result = await this.evolutionService.sendImage(phone, image, caption);

      return res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to send image',
      });
    }
  }

  /**
   * @swagger
   * /api/send-video:
   *   post:
   *     summary: Send video message
   *     tags: [Messages]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - phone
   *               - video
   *             properties:
   *               phone:
   *                 type: string
   *               video:
   *                 type: string
   *               caption:
   *                 type: string
   *     responses:
   *       200:
   *         description: Video sent successfully
   */
  async sendVideo(req: Request, res: Response) {
    try {
      const { phone, video, caption } = req.body;

      if (!phone || !video) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: phone, video',
        });
      }

      const result = await this.evolutionService.sendVideo(phone, video, caption);

      return res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to send video',
      });
    }
  }

  /**
   * @swagger
   * /api/send-audio:
   *   post:
   *     summary: Send audio message
   *     tags: [Messages]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - phone
   *               - audio
   *             properties:
   *               phone:
   *                 type: string
   *               audio:
   *                 type: string
   *     responses:
   *       200:
   *         description: Audio sent successfully
   */
  async sendAudio(req: Request, res: Response) {
    try {
      const { phone, audio } = req.body;

      if (!phone || !audio) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: phone, audio',
        });
      }

      const result = await this.evolutionService.sendAudio(phone, audio);

      return res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to send audio',
      });
    }
  }

  /**
   * @swagger
   * /api/send-document:
   *   post:
   *     summary: Send document
   *     tags: [Messages]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - phone
   *               - document
   *             properties:
   *               phone:
   *                 type: string
   *               document:
   *                 type: string
   *               fileName:
   *                 type: string
   *     responses:
   *       200:
   *         description: Document sent successfully
   */
  async sendDocument(req: Request, res: Response) {
    try {
      const { phone, document, fileName } = req.body;

      if (!phone || !document) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: phone, document',
        });
      }

      const result = await this.evolutionService.sendDocument(phone, document, fileName);

      return res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to send document',
      });
    }
  }

  /**
   * @swagger
   * /api/send-location:
   *   post:
   *     summary: Send location
   *     tags: [Messages]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - phone
   *               - latitude
   *               - longitude
   *             properties:
   *               phone:
   *                 type: string
   *               latitude:
   *                 type: number
   *               longitude:
   *                 type: number
   *               name:
   *                 type: string
   *               address:
   *                 type: string
   *     responses:
   *       200:
   *         description: Location sent successfully
   */
  async sendLocation(req: Request, res: Response) {
    try {
      const { phone, latitude, longitude, name, address } = req.body;

      if (!phone || latitude === undefined || longitude === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: phone, latitude, longitude',
        });
      }

      const result = await this.evolutionService.sendLocation(phone, latitude, longitude, name, address);

      return res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to send location',
      });
    }
  }

  /**
   * @swagger
   * /api/send-contact:
   *   post:
   *     summary: Send contact
   *     tags: [Messages]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - phone
   *               - contactPhone
   *               - contactName
   *             properties:
   *               phone:
   *                 type: string
   *               contactPhone:
   *                 type: string
   *               contactName:
   *                 type: string
   *     responses:
   *       200:
   *         description: Contact sent successfully
   */
  async sendContact(req: Request, res: Response) {
    try {
      const { phone, contactPhone, contactName } = req.body;

      if (!phone || !contactPhone || !contactName) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: phone, contactPhone, contactName',
        });
      }

      const result = await this.evolutionService.sendContact(phone, contactPhone, contactName);

      return res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to send contact',
      });
    }
  }

  /**
   * @swagger
   * /api/send-buttons:
   *   post:
   *     summary: Send buttons message
   *     tags: [Messages]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - phone
   *               - title
   *               - description
   *               - buttons
   *             properties:
   *               phone:
   *                 type: string
   *               title:
   *                 type: string
   *               description:
   *                 type: string
   *               buttons:
   *                 type: array
   *                 items:
   *                   type: string
   *     responses:
   *       200:
   *         description: Buttons sent successfully
   */
  async sendButtons(req: Request, res: Response) {
    try {
      const { phone, title, description, buttons } = req.body;

      if (!phone || !title || !description || !buttons || !Array.isArray(buttons)) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: phone, title, description, buttons (array)',
        });
      }

      const result = await this.evolutionService.sendButtons(phone, title, description, buttons);

      return res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to send buttons',
      });
    }
  }
}
