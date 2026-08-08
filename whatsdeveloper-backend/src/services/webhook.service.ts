import axios from 'axios';
import fs from 'fs';
import path from 'path';

export interface WebhookConfig {
  url: string;
  enabled: boolean;
}

export interface WebhookPayload {
  uuid: string;
  event: string;
  timestamp: number;
  data: {
    from: string;
    fromName?: string;
    to: string;
    message?: {
      type: string;
      body?: string;
      caption?: string;
      url?: string;
      mimetype?: string;
      filename?: string;
      latitude?: number;
      longitude?: number;
      contactName?: string;
      contactNumber?: string;
    };
    messageId: string;
    isGroup: boolean;
    groupName?: string;
    isAd?: boolean;
    adMetadata?: {
      isForwarded: boolean;
      forwardingScore: number;
      detectionReason: string[];
      extractedUrls?: string[];
    };
  };
}

export class WebhookService {
  private static instance: WebhookService;
  private webhooks: Map<string, WebhookConfig> = new Map();
  private storageFile: string;

  private constructor() {
    // Store webhooks in a JSON file for persistence
    this.storageFile = path.join(process.cwd(), '.webhooks.json');
    this.loadWebhooks();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): WebhookService {
    if (!WebhookService.instance) {
      WebhookService.instance = new WebhookService();
    }
    return WebhookService.instance;
  }

  /**
   * Load webhooks from file
   */
  private loadWebhooks() {
    try {
      if (fs.existsSync(this.storageFile)) {
        const data = fs.readFileSync(this.storageFile, 'utf-8');
        const webhooks = JSON.parse(data);
        this.webhooks = new Map(Object.entries(webhooks));
        console.log(`[Webhook] Loaded ${this.webhooks.size} webhook(s) from storage`);
      }
    } catch (error) {
      console.error('[Webhook] Failed to load webhooks:', error);
    }
  }

  /**
   * Save webhooks to file
   */
  private saveWebhooks() {
    try {
      const data = Object.fromEntries(this.webhooks);
      fs.writeFileSync(this.storageFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('[Webhook] Failed to save webhooks:', error);
    }
  }

  /**
   * Register webhook URL for an instance/UUID
   */
  registerWebhook(uuid: string, url: string, enabled: boolean = true) {
    this.webhooks.set(uuid, { url, enabled });
    this.saveWebhooks();
    console.log(`[Webhook] Registered for UUID: ${uuid} → ${url}`);
  }

  /**
   * Get webhook config for UUID
   */
  getWebhook(uuid: string): WebhookConfig | undefined {
    return this.webhooks.get(uuid);
  }

  /**
   * Send webhook payload
   */
  async sendWebhook(uuid: string, payload: WebhookPayload): Promise<boolean> {
    const config = this.webhooks.get(uuid);

    if (!config || !config.enabled) {
      console.log(`[Webhook] No active webhook for UUID: ${uuid}`);
      return false;
    }

    try {
      await axios.post(config.url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Source': 'WhatsDeveloper',
        },
        timeout: 10000,
      });

      console.log(`[Webhook] Sent to ${config.url} for UUID: ${uuid}`);
      return true;
    } catch (error: any) {
      console.error(`[Webhook] Failed to send to ${config.url}:`, error.message);
      return false;
    }
  }

  /**
   * Transform Evolution message to WhatsDeveloper webhook payload
   */
  transformMessage(evolutionMessage: any, uuid: string): WebhookPayload {
    const key = evolutionMessage.key || {};
    const message = evolutionMessage.message || {};
    const messageType = this.detectMessageType(message);

    const payload: WebhookPayload = {
      uuid,
      event: 'message.received',
      timestamp: evolutionMessage.messageTimestamp || Date.now(),
      data: {
        from: key.remoteJid || '',
        fromName: evolutionMessage.pushName || '',
        to: key.participant || key.remoteJid || '',
        messageId: key.id || '',
        isGroup: key.remoteJid?.endsWith('@g.us') || false,
        groupName: evolutionMessage.groupName || '',
      },
    };

    // Detect if message is an ad
    const adDetection = this.detectAd(message);
    if (adDetection.isAd) {
      payload.data.isAd = true;
      payload.data.adMetadata = adDetection.metadata;
    }

    // Extract message content based on type
    switch (messageType) {
      case 'text':
        payload.data.message = {
          type: 'text',
          body: message.conversation || message.extendedTextMessage?.text || '',
        };
        break;

      case 'image':
        payload.data.message = {
          type: 'image',
          caption: message.imageMessage?.caption || '',
          url: message.imageMessage?.url || '',
          mimetype: message.imageMessage?.mimetype || 'image/jpeg',
        };
        break;

      case 'video':
        payload.data.message = {
          type: 'video',
          caption: message.videoMessage?.caption || '',
          url: message.videoMessage?.url || '',
          mimetype: message.videoMessage?.mimetype || 'video/mp4',
        };
        break;

      case 'audio':
        payload.data.message = {
          type: 'audio',
          url: message.audioMessage?.url || '',
          mimetype: message.audioMessage?.mimetype || 'audio/ogg',
        };
        break;

      case 'document':
        payload.data.message = {
          type: 'document',
          caption: message.documentMessage?.caption || '',
          url: message.documentMessage?.url || '',
          filename: message.documentMessage?.fileName || 'document',
          mimetype: message.documentMessage?.mimetype || 'application/octet-stream',
        };
        break;

      case 'location':
        payload.data.message = {
          type: 'location',
          latitude: message.locationMessage?.degreesLatitude || 0,
          longitude: message.locationMessage?.degreesLongitude || 0,
        };
        break;

      case 'contact':
        const vcard = message.contactMessage?.vcard || '';
        const contactName = this.extractVCardName(vcard);
        const contactNumber = this.extractVCardPhone(vcard);

        payload.data.message = {
          type: 'contact',
          contactName,
          contactNumber,
        };
        break;

      default:
        payload.data.message = {
          type: 'unknown',
          body: JSON.stringify(message),
        };
    }

    return payload;
  }

  /**
   * Detect message type from Evolution message object
   */
  private detectMessageType(message: any): string {
    if (message.conversation || message.extendedTextMessage) return 'text';
    if (message.imageMessage) return 'image';
    if (message.videoMessage) return 'video';
    if (message.audioMessage) return 'audio';
    if (message.documentMessage) return 'document';
    if (message.locationMessage) return 'location';
    if (message.contactMessage) return 'contact';
    return 'unknown';
  }

  /**
   * Extract name from vCard
   */
  private extractVCardName(vcard: string): string {
    const match = vcard.match(/FN:(.*)/);
    return match ? match[1].trim() : 'Unknown';
  }

  /**
   * Extract phone from vCard
   */
  private extractVCardPhone(vcard: string): string {
    const match = vcard.match(/TEL[^:]*:(.*)/);
    return match ? match[1].trim() : '';
  }

  /**
   * Detect if message is a Facebook Ad
   */
  private detectAd(message: any): { isAd: boolean; metadata?: any } {
    const reasons: string[] = [];
    let isForwarded = false;
    let forwardingScore = 0;
    const extractedUrls: string[] = [];

    // Get message text
    const text = message.conversation || message.extendedTextMessage?.text || message.imageMessage?.caption || '';

    // Get contextInfo
    const contextInfo = message.extendedTextMessage?.contextInfo || message.imageMessage?.contextInfo || {};

    // Check 1: Is Forwarded
    if (contextInfo.isForwarded === true) {
      isForwarded = true;
      reasons.push('isForwarded');
    }

    // Check 2: Forwarding Score
    if (contextInfo.forwardingScore && contextInfo.forwardingScore > 0) {
      forwardingScore = contextInfo.forwardingScore;
      reasons.push(`forwardingScore:${forwardingScore}`);
    }

    // Check 3: Ad Text Patterns (case-insensitive)
    const adPatterns = [
      /click here/i,
      /shop now/i,
      /learn more/i,
      /buy now/i,
      /get offer/i,
      /limited time/i,
      /special offer/i,
      /exclusive deal/i,
      /احصل على/i,
      /تسوق الآن/i,
      /عرض خاص/i,
      /عرض محدود/i,
    ];

    for (const pattern of adPatterns) {
      if (pattern.test(text)) {
        reasons.push(`text_pattern:${pattern.source}`);
        break;
      }
    }

    // Check 4: URL Patterns
    const urlPattern = /(https?:\/\/[^\s]+)/gi;
    const urls = text.match(urlPattern) || [];

    for (const url of urls) {
      extractedUrls.push(url);

      // Facebook ad domains
      if (
        url.includes('facebook.com/ads') ||
        url.includes('l.facebook.com') ||
        url.includes('fb.me') ||
        url.includes('fbclid=')
      ) {
        reasons.push(`url_pattern:${url.substring(0, 50)}`);
      }
    }

    // Check 5: Sponsored indicator
    if (text.toLowerCase().includes('sponsored') || text.toLowerCase().includes('إعلان')) {
      reasons.push('sponsored_text');
    }

    // Determine if it's an ad
    const isAd = reasons.length > 0 || (isForwarded && forwardingScore > 0);

    if (!isAd) {
      return { isAd: false };
    }

    return {
      isAd: true,
      metadata: {
        isForwarded,
        forwardingScore,
        detectionReason: reasons,
        extractedUrls: extractedUrls.length > 0 ? extractedUrls : undefined,
      },
    };
  }
}
