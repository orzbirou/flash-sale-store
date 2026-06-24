export const CART_TTL_MS = 5 * 60 * 1000;
export const CART_CLEANER_INTERVAL_MS = 60 * 1000;

export function cartExpiresAt(from: Date = new Date()): Date {
  return new Date(from.getTime() + CART_TTL_MS);
}
