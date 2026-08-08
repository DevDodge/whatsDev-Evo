import { Request, Response } from 'express';
import axios from 'axios';
import { EvolutionService } from '../services/evolution.service';
import { resolveSpintax, formatPhoneNumber, delay } from '../services/utils.service';

interface MessageBase {
  type: string;
}

interface TextMessage extends MessageBase {
  type: 'text';
  content: string;
}

interface ImageMessage extends MessageBase {
  type: 'image';
  url?: string;
  base64?: string;
  caption?: string;
}

interface VideoMessage extends MessageBase {
  type: 'video';
  url?: string;
  base64?: string;
  caption?: string;
}

interface AudioMessage extends MessageBase {
  type: 'audio' | 'voice' | 'ptt';
  url?: string;
  base64?: string;
  ptt?: boolean;
}

interface DocumentMessage extends MessageBase {
  type: 'document';
  url?: string;
  base64?: string;
  filename?: string;
  caption?: string;
}

interface LocationMessage extends MessageBase {
  type: 'location';
  latitude: number;
  longitude: number;
  description?: string;
}

interface ContactMessage extends MessageBase {
  type: 'contact';
  contactName: string;
  contactNumber: string;
}

interface CatalogMessage extends MessageBase {
  type: 'catalog';
  images: Array<{ imageUrl?: string; imageBase64?: string }>;
  caption?: string;
  captionMode?: 'text_before' | 'all' | 'first' | 'none';
}

type Message =
  | TextMessage
  | ImageMessage
  | VideoMessage
  | AudioMessage
  | DocumentMessage
  | LocationMessage
  | ContactMessage
  | CatalogMessage;

interface SequenceRequest {
  to: string;
  messages: Message[];
  delayMs?: number;
}

interface MessageResult {
  index: number;
  type: string;
  status: 'sent' | 'failed';
  queueId?: number;
  messageId?: string;
  error?: string;
}

export class SequenceController {
  constructor(private evolutionService: EvolutionService) {}

  async sendSequence(req: Request, res: Response) {
    try {
      const { to, messages, delayMs = 3000 }: SequenceRequest = req.body;
      const apiToken = (req as any).apiToken; // From auth middleware

      // Validation
      if (!to) {
        return res.status(400).json({
          success: false,
          error: 'Missing required field: to',
        });
      }

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Missing or empty "messages" array',
        });
      }

      if (messages.length > 20) {
        return res.status(400).json({
          success: false,
          error: 'Maximum 20 messages per sequence allowed',
        });
      }

      // Check instance availability
      const isAvailable = await this.evolutionService.isInstanceAvailable(undefined, apiToken);
      if (!isAvailable) {
        return res.status(400).json({
          success: false,
          error: 'WhatsApp client not available',
        });
      }

      // Format phone
      const phone = formatPhoneNumber(to);
      const chatId = `${phone}@s.whatsapp.net`;

      // Clamp delay
      const actualDelay = Math.max(1000, Math.min(delayMs, 15000));

      // Process messages sequentially
      const results: MessageResult[] = [];
      let sentCount = 0;
      let failedCount = 0;

      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        const msgType = (msg.type || 'text').toLowerCase();

        try {
          let result: any;

          switch (msgType) {
            case 'text':
              result = await this.sendTextMessage(phone, msg as TextMessage, apiToken);
              break;

            case 'image':
              result = await this.sendImageMessage(phone, msg as ImageMessage, apiToken);
              break;

            case 'video':
              result = await this.sendVideoMessage(phone, msg as VideoMessage, apiToken);
              break;

            case 'audio':
            case 'voice':
            case 'ptt':
              result = await this.sendAudioMessage(phone, msg as AudioMessage, apiToken);
              break;

            case 'document':
              result = await this.sendDocumentMessage(phone, msg as DocumentMessage, apiToken);
              break;

            case 'location':
              result = await this.sendLocationMessage(phone, msg as LocationMessage, apiToken);
              break;

            case 'contact':
              result = await this.sendContactMessage(phone, msg as ContactMessage, apiToken);
              break;

            case 'catalog':
              result = await this.sendCatalogMessage(phone, msg as CatalogMessage, apiToken);
              break;

            default:
              throw new Error(`Unknown message type: ${msgType}`);
          }

          results.push({
            index: i,
            type: msgType,
            status: 'sent',
            queueId: Date.now() + i, // Simulate queue ID
            messageId: result.key?.id || 'unknown',
          });

          sentCount++;
        } catch (error: any) {
          results.push({
            index: i,
            type: msgType,
            status: 'failed',
            error: error.message || 'Unknown error',
          });

          failedCount++;
        }

        // Apply delay between messages (except after last one)
        if (i < messages.length - 1) {
          await delay(actualDelay);
        }
      }

      // Response
      return res.json({
        success: failedCount === 0,
        sent: sentCount,
        failed: failedCount,
        total: messages.length,
        chatId,
        results,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
      });
    }
  }

  private async sendTextMessage(phone: string, msg: TextMessage, apiToken: string) {
    if (!msg.content) {
      throw new Error('Text message requires "content" field');
    }

    const content = resolveSpintax(msg.content);
    return await this.evolutionService.sendText(phone, content, undefined, apiToken);
  }

  private async sendImageMessage(phone: string, msg: ImageMessage, apiToken: string) {
    if (!msg.url && !msg.base64) {
      throw new Error('Image requires "url" or "base64" field');
    }

    if (msg.base64) {
      return await this.evolutionService.sendMediaBase64(phone, msg.base64, 'image', msg.caption, undefined, apiToken);
    } else {
      return await this.evolutionService.sendImage(phone, msg.url!, msg.caption, undefined, apiToken);
    }
  }

  private async sendVideoMessage(phone: string, msg: VideoMessage, apiToken: string) {
    if (!msg.url && !msg.base64) {
      throw new Error('Video requires "url" or "base64" field');
    }

    if (msg.base64) {
      return await this.evolutionService.sendMediaBase64(phone, msg.base64, 'video', msg.caption, undefined, apiToken);
    } else {
      return await this.evolutionService.sendVideo(phone, msg.url!, msg.caption, undefined, apiToken);
    }
  }

  private async sendAudioMessage(phone: string, msg: AudioMessage, apiToken: string) {
    if (!msg.url && !msg.base64) {
      throw new Error('Audio requires "url" or "base64" field');
    }

    const isPtt = msg.type === 'voice' || msg.type === 'ptt' || msg.ptt !== false;

    if (msg.base64) {
      // For base64 audio, use sendMediaBase64
      return await this.evolutionService.sendMediaBase64(phone, msg.base64, 'audio', undefined, undefined, apiToken);
    } else {
      return await this.evolutionService.sendAudio(phone, msg.url!, undefined, apiToken);
    }
  }

  private async sendDocumentMessage(phone: string, msg: DocumentMessage, apiToken: string) {
    if (!msg.url && !msg.base64) {
      throw new Error('Document requires "url" or "base64" field');
    }

    if (msg.base64) {
      return await this.evolutionService.sendMediaBase64(
        phone,
        msg.base64,
        'document',
        msg.caption,
        undefined,
        apiToken,
      );
    } else {
      return await this.evolutionService.sendDocument(phone, msg.url!, msg.filename, undefined, apiToken);
    }
  }

  private async sendLocationMessage(phone: string, msg: LocationMessage, apiToken: string) {
    if (msg.latitude === undefined || msg.longitude === undefined) {
      throw new Error('Location requires "latitude" and "longitude"');
    }

    return await this.evolutionService.sendLocation(
      phone,
      msg.latitude,
      msg.longitude,
      msg.description,
      msg.description,
      undefined,
      apiToken,
    );
  }

  private async sendContactMessage(phone: string, msg: ContactMessage, apiToken: string) {
    if (!msg.contactName || !msg.contactNumber) {
      throw new Error('Contact requires "contactName" and "contactNumber"');
    }

    return await this.evolutionService.sendContact(phone, msg.contactNumber, msg.contactName, undefined, apiToken);
  }

  private async sendCatalogMessage(phone: string, msg: CatalogMessage, apiToken: string) {
    if (!msg.images || msg.images.length === 0) {
      throw new Error('Catalog requires "images" array');
    }

    if (msg.images.length > 30) {
      throw new Error('Catalog max 30 images');
    }

    const captionMode = msg.captionMode || 'text_before';

    // Send caption as text before if needed
    if (captionMode === 'text_before' && msg.caption) {
      await this.evolutionService.sendText(phone, msg.caption, undefined, apiToken);
      await delay(1000);
    }

    // Send images
    for (let i = 0; i < msg.images.length; i++) {
      const img = msg.images[i];
      let caption = '';

      if (captionMode === 'all') {
        caption = msg.caption || '';
      } else if (captionMode === 'first' && i === 0) {
        caption = msg.caption || '';
      }

      if (img.imageUrl) {
        await this.evolutionService.sendImage(phone, img.imageUrl, caption, undefined, apiToken);
      } else if (img.imageBase64) {
        await this.evolutionService.sendMediaBase64(phone, img.imageBase64, 'image', caption, undefined, apiToken);
      }

      // Small delay between catalog images
      if (i < msg.images.length - 1) {
        await delay(500);
      }
    }

    return { success: true };
  }
}
