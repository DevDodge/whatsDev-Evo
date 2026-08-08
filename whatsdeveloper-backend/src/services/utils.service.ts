/**
 * Simple spintax resolver
 * Converts {option1|option2|option3} to one random option
 */
export function resolveSpintax(text: string): string {
  if (!text) return text;

  return text.replace(/\{([^}]+)\}/g, (match, content) => {
    const options = content.split('|');
    return options[Math.floor(Math.random() * options.length)];
  });
}

/**
 * Format phone number for WhatsApp
 * Removes + and @s.whatsapp.net if present
 */
export function formatPhoneNumber(phone: string): string {
  return phone.replace(/\+/g, '').replace(/@s\.whatsapp\.net/g, '');
}

/**
 * Delay helper
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
