export function generateId(): string {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch { /* fallback */ }
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 11);
}
