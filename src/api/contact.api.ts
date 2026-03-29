import axios from './axios';

/**
 * Contact API
 *
 * TWO endpoints:
 * - GET  /contacts/:roomId  → Pure READ (no writes, no slot consumption)
 * - POST /contacts/unlock   → WRITE (SERIALIZABLE transaction, limit enforcement)
 */

export interface UnlockContactRequest {
  roomId: string;
}
export interface UnlockContactResponse {
  ownerName: string;
  ownerPhone: string | null;
  ownerEmail: string;
}
export interface ReadContactResponse {
  ownerName: string;
  ownerPhone: string | null;
  ownerEmail: string;
  alreadyUnlocked: boolean;
}
export interface UnlockContactResult {
  success: boolean;
  data?: UnlockContactResponse;
  meta?: {
    alreadyUnlocked: boolean;
  };
  error?: {
    code: string;
    message: string;
  };
}
export interface ReadContactResult {
  success: boolean;
  data?: ReadContactResponse;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * READ owner contact for a specific room.
 * Pure read — no writes, no slot consumption.
 *
 * Returns contact if:
 *   - Previously unlocked (PropertyView exists), OR
 *   - Paid subscription active for room's city
 *
 * Returns CONTACT_LOCKED (403) if neither condition met.
 */
export const readContact = async (roomId: string): Promise<ReadContactResult> => {
  try {
    const response = await axios.get(`/contacts/${roomId}`);
    return {
      success: true,
      data: response.data.data
    };
  } catch (error: any) {
    const code = error.response?.data?.code || 'UNKNOWN_ERROR';
    const message = error.response?.data?.message || 'Failed to read contact';
    return {
      success: false,
      error: {
        code,
        message
      }
    };
  }
};

/**
 * Unlock owner contact for a specific room.
 * WRITE path — SERIALIZABLE transaction, limit enforcement, dedup.
 *
 * @returns Contact data on success
 * @throws Error with `code` property on failure:
 *   - CONTACT_LIMIT_REACHED (403): Free limit exhausted for this city
 *   - ROOM_INACTIVE (400): Property no longer active
 *   - ROOM_NOT_APPROVED (400): Property not yet approved
 *   - UNAUTHORIZED (401): Not logged in
 */
export const unlockContact = async (roomId: string): Promise<UnlockContactResult> => {
  try {
    const response = await axios.post('/contacts/unlock', {
      roomId
    });
    console.log('unlockContact response:', response);
    return {
      success: true,
      data: response.data.data,
      meta: response.data.meta
    };
  } catch (error: any) {
    const code = error.response?.data?.code || 'UNKNOWN_ERROR';
    const message = error.response?.data?.message || 'Failed to unlock contact';
    return {
      success: false,
      error: {
        code,
        message
      }
    };
  }
};
export const contactApi = {
  read: readContact,
  unlock: unlockContact
};