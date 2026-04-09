/**
 * Generate a unique ID for database records.
 * Tries to use crypto.randomUUID() if available.
 * Falls back to a time-based + random combination for compatibility.
 */
export function generateId(): string {
  // Try crypto.randomUUID() first (available in modern React Native / Expo)
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch {
    // Fall through to fallback
  }

  // Fallback: combine timestamp and random component
  // This is unique enough for local SQLite primary keys
  const timestamp = Date.now().toString(36); // Converts timestamp to base36
  const random = Math.random().toString(36).substring(2, 11); // Random alphanumeric
  return `${timestamp}${random}`;
}
