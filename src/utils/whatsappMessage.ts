/**
 * Builds a WhatsApp message for property inquiries
 * Single source of truth for all property WhatsApp communications
 * @param name - Owner name
 * @param title - Property title
 * @param propertyId - Property ID
 * @returns Formatted WhatsApp message string
 */
export function buildPropertyWhatsappMessage({
  name,
  title,
  propertyId,
}: {
  name: string;
  title: string;
  propertyId: string;
}): string {
  const url = `${import.meta.env.VITE_API_URL}/rooms/${propertyId}`;

  return `🏠 *Homilivo — Property Platform*

Hi ${name},

🎉 Great news! Your property *"${title}"* is now live on Homilivo.

🚀 Start receiving tenant inquiries faster and increase your chances of renting quickly.

✨ *What you get:*
• 100% FREE listing
• Verified tenant leads
• Easy property management

━━━━━━━━━━━━━━━
👉 *VIEW YOUR PROPERTY*
${url}
━━━━━━━━━━━━━━━

Need help? Just reply here — we're happy to assist 🙂`;
}

/**
 * Generates a properly formatted WhatsApp Web URL with encoded message
 * @param phoneNumber - 10-digit phone number
 * @param message - Message content
 * @returns WhatsApp Web URL
 */
export function generateWhatsAppUrl(
  phoneNumber: string,
  message: string,
): string {
  const clean = phoneNumber.replace(/\D/g, "");

  const finalPhone =
    clean.length === 10 ? `91${clean}` : clean;

  return `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Validates if a phone number is valid for WhatsApp
 * @param phone - Phone number to validate
 * @returns true if valid 10-digit phone
 */
export function isValidWhatsAppPhone(phone?: string): boolean {
  if (!phone) return false;
  const clean = phone.replace(/\D/g, "");
  return clean.length === 10;
}
