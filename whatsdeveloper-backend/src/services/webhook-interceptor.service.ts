/**
 * Evolution Webhook Auto-Interceptor
 *
 * This script intercepts webhook saves in Evolution Manager
 * and automatically:
 * 1. Registers the n8n URL in Backend
 * 2. Sets Evolution webhook to Backend instead
 */

import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:55453';
const EVOLUTION_URL = process.env.EVOLUTION_API_URL || 'http://localhost:2345';
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || '';

export async function interceptWebhookSave(instanceName: string, webhookUrl: string): Promise<boolean> {
  try {
    console.log(`[Webhook Interceptor] Intercepting webhook save for ${instanceName}`);
    console.log(`[Webhook Interceptor] User wants to send to: ${webhookUrl}`);

    // Step 1: Register the user's n8n URL in Backend
    console.log(`[Webhook Interceptor] Step 1: Registering n8n webhook in Backend...`);
    await axios.post(`${BACKEND_URL}/api/webhook/register/${instanceName}`, {
      url: webhookUrl,
      enabled: true,
    });
    console.log(`[Webhook Interceptor] ✓ Registered n8n webhook in Backend`);

    // Step 2: Change the webhook URL to Backend instead of n8n
    const backendWebhookUrl = `${BACKEND_URL}/api/webhook/incoming/${instanceName}`;
    console.log(`[Webhook Interceptor] Step 2: Setting Evolution to send to Backend...`);
    console.log(`[Webhook Interceptor] New URL: ${backendWebhookUrl}`);

    await axios.post(`${EVOLUTION_URL}/webhook/set/${instanceName}`, {
      webhook: {
        enabled: true,
        url: backendWebhookUrl,
        events: ['MESSAGES_UPSERT'],
        webhookByEvents: false,
        webhookBase64: false,
      },
    }, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': EVOLUTION_API_KEY,
      },
    });

    console.log(`[Webhook Interceptor] ✓ Evolution configured to send to Backend`);
    console.log(`[Webhook Interceptor] Flow: WhatsApp → Evolution → Backend → n8n`);

    return true;
  } catch (error: any) {
    console.error(`[Webhook Interceptor] Error:`, error.message);
    return false;
  }
}
