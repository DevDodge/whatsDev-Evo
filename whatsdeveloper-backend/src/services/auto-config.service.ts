import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export interface AutoConfigOptions {
  evolutionApiUrl: string;
  evolutionApiKey: string;
  instanceName: string;
  backendPublicUrl: string;
  n8nWebhookUrl: string;
}

export class AutoConfigService {
  private options: AutoConfigOptions;

  constructor(options: AutoConfigOptions) {
    this.options = options;
  }

  /**
   * Auto-configure webhooks on startup
   */
  async configure(): Promise<void> {
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║     Auto-Configuring Webhooks...                     ║');
    console.log('╠═══════════════════════════════════════════════════════╣');

    try {
      // Step 1: Register n8n webhook in Backend (local)
      await this.registerLocalWebhook();

      // Step 2: Wait for Evolution API to be ready
      await this.waitForEvolution();

      // Step 3: Configure Evolution API to send to Backend
      await this.configureEvolutionWebhook();

      console.log('╠═══════════════════════════════════════════════════════╣');
      console.log('║  ✅ Webhook Auto-Configuration Complete!             ║');
      console.log('╠═══════════════════════════════════════════════════════╣');
      console.log(`║  Flow: WhatsApp → Evolution → Backend → n8n          ║`);
      console.log('╚═══════════════════════════════════════════════════════╝');
    } catch (error: any) {
      console.log('╠═══════════════════════════════════════════════════════╣');
      console.log('║  ⚠️  Webhook Auto-Configuration Failed               ║');
      console.log('╠═══════════════════════════════════════════════════════╣');
      console.log(`║  Error: ${error.message.substring(0, 43).padEnd(43)} ║`);
      console.log('║  Backend will continue, but webhooks need manual     ║');
      console.log('║  configuration. Check WEBHOOK-FLOW-FIX.md            ║');
      console.log('╚═══════════════════════════════════════════════════════╝');
    }
  }

  /**
   * Register n8n webhook in local backend
   */
  private async registerLocalWebhook(): Promise<void> {
    console.log('║  [1/3] Registering n8n webhook in Backend...         ║');

    const { WebhookService } = await import('./webhook.service');
    const webhookService = WebhookService.getInstance();

    webhookService.registerWebhook(
      this.options.instanceName,
      this.options.n8nWebhookUrl,
      true
    );

    console.log(`║  ✓ Registered: ${this.options.n8nWebhookUrl.substring(0, 33).padEnd(33)} ║`);
  }

  /**
   * Wait for Evolution API to be ready
   */
  private async waitForEvolution(): Promise<void> {
    console.log('║  [2/3] Waiting for Evolution API...                  ║');

    const maxRetries = 10;
    const retryDelay = 2000;

    for (let i = 0; i < maxRetries; i++) {
      try {
        await axios.get(`${this.options.evolutionApiUrl}/`, {
          timeout: 3000,
        });
        console.log('║  ✓ Evolution API is ready                            ║');
        return;
      } catch (error) {
        if (i === maxRetries - 1) {
          throw new Error('Evolution API not responding');
        }
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  /**
   * Configure Evolution API to send webhooks to Backend
   */
  private async configureEvolutionWebhook(): Promise<void> {
    console.log('║  [3/3] Configuring Evolution webhook...              ║');

    const backendWebhookUrl = `${this.options.backendPublicUrl}/api/webhook/incoming`;

    try {
      // Evolution API expects: POST /webhook/set/:instanceName
      // Events must be uppercase: MESSAGES_UPSERT not messages.upsert
      const response = await axios.post(
        `${this.options.evolutionApiUrl}/webhook/set/${this.options.instanceName}`,
        {
          webhook: {
            enabled: true,
            url: backendWebhookUrl,
            events: ['MESSAGES_UPSERT'], // ← بحروف كبيرة!
            webhookByEvents: false,
            webhookBase64: false,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.options.evolutionApiKey,
          },
          timeout: 15000,
          validateStatus: (status) => status < 500, // Accept 4xx responses
        }
      );

      if (response.status >= 200 && response.status < 300) {
        console.log(`║  ✓ Evolution webhook: ${backendWebhookUrl.substring(0, 28).padEnd(28)} ║`);
      } else if (response.status === 404) {
        console.log('║  ⚠️  Instance not found, will configure on demand    ║');
      } else if (response.status === 401 || response.status === 403) {
        throw new Error('Invalid Evolution API key');
      } else {
        console.log(`║  ⚠️  Evolution returned status ${response.status}               ║`);
        console.log('║  Response:', JSON.stringify(response.data).substring(0, 40));
      }
    } catch (error: any) {
      // Log detailed error for debugging
      if (error.response) {
        console.log('║  ⚠️  Evolution API Error:                            ║');
        console.log(`║  Status: ${error.response.status}                                  ║`);
        console.log(`║  Data: ${JSON.stringify(error.response.data).substring(0, 36).padEnd(36)} ║`);
      } else if (error.request) {
        console.log('║  ⚠️  No response from Evolution API                  ║');
        console.log(`║  Check if Evolution is running on ${this.options.evolutionApiUrl.substring(0, 16)}... ║`);
      } else {
        console.log(`║  ⚠️  Error: ${error.message.substring(0, 39).padEnd(39)} ║`);
      }

      throw new Error(`Evolution config failed: ${error.message}`);
    }
  }

  /**
   * Get current configuration status
   */
  async getStatus(): Promise<{
    backend: { configured: boolean; url: string };
    evolution: { configured: boolean; url: string };
  }> {
    // Must match exactly what configureEvolutionWebhook() registers (includes /api/),
    // otherwise the comparison below always fails and status reports "not configured".
    const backendWebhookUrl = `${this.options.backendPublicUrl}/api/webhook/incoming`;

    // Check backend
    const { WebhookService } = await import('./webhook.service');
    const webhookService = WebhookService.getInstance();
    const backendConfig = webhookService.getWebhook(this.options.instanceName);

    // Check Evolution
    let evolutionConfigured = false;
    try {
      const response = await axios.get(
        `${this.options.evolutionApiUrl}/webhook/find/${this.options.instanceName}`,
        {
          headers: { 'apikey': this.options.evolutionApiKey },
          timeout: 5000,
        }
      );

      evolutionConfigured =
        response.data?.enabled === true &&
        response.data?.url === backendWebhookUrl;
    } catch (error) {
      evolutionConfigured = false;
    }

    return {
      backend: {
        configured: !!backendConfig && backendConfig.enabled,
        url: backendConfig?.url || 'not configured',
      },
      evolution: {
        configured: evolutionConfigured,
        url: backendWebhookUrl,
      },
    };
  }
}
