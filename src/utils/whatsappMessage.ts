/**
 * Builds a WhatsApp message for property inquiries
 * Single source of truth for all property WhatsApp communications
 * Uses Unicode escape sequences to ensure emojis are UTF-8 safe
 * @param name - Owner name
 * @param title - Property title
 * @param propertyId - Property ID
 * @returns Formatted WhatsApp message string with proper Unicode encoding
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
  const frontendUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
  const VITE_FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
  const url = `${frontendUrl.replace(/\/$/, "")}/review/${propertyId}`;

  return `🏠 *Homilivo* - Property Rental Platform

Hi ${name},

We found your property *"${title}"* and created a *FREE listing* on Homilivo to help you get tenant inquiries faster.

⚠️ Some details are auto-added and may need correction.

👉 Please review and update your property:
${url}

🔥 Verified listings get more visibility and faster responses.

⏱ It only takes 1–2 minutes.

If this isn’t your property, you can ignore this message.
visit ${VITE_FRONTEND_URL} for more info.

Need help? Just reply here 🙂`;
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

  const finalPhone = clean.length === 10 ? `91${clean}` : clean;
  const encodedMessage = encodeURIComponent(message);
  console.log(message);
  console.log(encodedMessage);
  return `https://api.whatsapp.com/send?phone=${finalPhone}&text=${encodedMessage}`;
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
