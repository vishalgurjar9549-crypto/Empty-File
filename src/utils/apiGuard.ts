/**
 * GLOBAL API PARAMETER GUARD
 *
 * Prevents ANY frontend API call from firing with invalid params.
 *
 * Behavior:
 * - Development: Throws error (loud fail for debugging)
 * - Production: Logs warning, returns false (silent prevention)
 *
 * Usage:
 *   assertValidParam(id, 'roomId');           // throws/warns if invalid
 *   assertValidParams({ city, roomId });      // checks multiple at once
 *   if (!isValidParam(city)) return null;     // boolean check
 */

const INVALID_VALUES = ['undefined', 'null', 'NaN', ''];
const isDev = typeof import.meta !== 'undefined' && import.meta.env?.DEV === true;

/**
 * Check if a single param is valid (non-null, non-undefined, non-empty, not string "undefined")
 */
export function isValidParam(param: unknown): param is string {
  if (param === undefined || param === null) return false;
  if (typeof param !== 'string' && typeof param !== 'number') return false;
  const str = String(param).trim();
  if (str === '' || INVALID_VALUES.includes(str)) return false;
  return true;
}

/**
 * Assert a single param is valid. Throws in dev, warns in prod.
 * Returns true if valid, false if invalid.
 */
export function assertValidParam(param: unknown, name: string): boolean {
  if (isValidParam(param)) return true;
  const message = `[API Guard] Blocked call: "${name}" is invalid (received: ${JSON.stringify(param)})`;
  if (isDev) {
    console.error(message);
    throw new Error(message);
  } else {
    console.warn(message);
  }
  return false;
}

/**
 * Assert multiple params are valid at once.
 * Returns true only if ALL params are valid.
 *
 * Usage:
 *   if (!assertValidParams({ city, roomId, userId })) return null;
 */
export function assertValidParams(params: Record<string, unknown>): boolean {
  for (const [name, value] of Object.entries(params)) {
    if (!assertValidParam(value, name)) return false;
  }
  return true;
}

/**
 * Guard wrapper for async API functions.
 * Returns null/empty array if params are invalid, preventing the network call.
 *
 * Usage:
 *   export const getRoomById = guardedApi(
 *     { id: 'roomId' },
 *     async (id: string) => { ... }
 *   );
 */
export function guardedApi<TArgs extends unknown[], TReturn>(paramNames: Record<number, string>, fn: (...args: TArgs) => Promise<TReturn>, fallback?: TReturn): (...args: TArgs) => Promise<TReturn> {
  return async (...args: TArgs): Promise<TReturn> => {
    for (const [index, name] of Object.entries(paramNames)) {
      if (!assertValidParam(args[Number(index)], name)) {
        if (fallback !== undefined) return fallback;
        throw new Error(`[API Guard] Invalid parameter: ${name}`);
      }
    }
    return fn(...args);
  };
}