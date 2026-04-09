/**
 * Colombian Peso (COP) currency utilities
 * All amounts are stored as integers (pesos, not cents - COP doesn't use cents in practice)
 */

export const COP_LOCALE = 'es-CO' as const;
export const COP_CURRENCY = 'COP' as const;

/**
 * Format amount as Colombian Peso currency
 * Example: 150000 → "$ 1.500" (Colombian format: dot as thousands separator, no decimals)
 */
export function formatCOP(amountCOP: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amountCOP);
}

/**
 * Format large amounts compactly
 * Example: 1500000 → "$ 1.5M", 15000 → "$ 15K"
 */
export function formatCOPCompact(amountCOP: number): string {
  const absAmount = Math.abs(amountCOP);

  if (absAmount >= 1_000_000) {
    const millions = amountCOP / 1_000_000;
    const formatted = millions.toFixed(millions % 1 === 0 ? 0 : 1);
    return `$ ${formatted}M`;
  }

  if (absAmount >= 1_000) {
    const thousands = amountCOP / 1_000;
    const formatted = thousands.toFixed(thousands % 1 === 0 ? 0 : 1);
    return `$ ${formatted}K`;
  }

  return formatCOP(amountCOP);
}

/**
 * Parse COP currency string input to number
 * Example: "$ 1.500" or "1500" → 1500
 */
export function parseCOPInput(input: string): number {
  // Remove common currency/formatting characters
  let cleaned = input
    .replace(/[^\d]/g, '') // Remove all non-digits
    .trim();

  if (!cleaned) {
    throw new Error('Invalid currency input: no digits found');
  }

  const value = parseInt(cleaned, 10);

  if (isNaN(value)) {
    throw new Error('Invalid currency input: cannot parse as number');
  }

  return value;
}

/**
 * Format percentage with specified decimal places
 * Example: 12.567 → "12.6%" (with decimals=1)
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format absolute currency value (no sign)
 * Example: 150000 → "$ 1.500"
 */
export function formatCOPAbsolute(amountCOP: number): string {
  return formatCOP(Math.abs(amountCOP));
}

/**
 * Get the sign indicator for a transaction
 * Example: -15000 → "-", 5000 → "+"
 */
export function getCurrencySign(amountCOP: number): '+' | '-' {
  return amountCOP >= 0 ? '+' : '-';
}

/**
 * Format currency with explicit sign
 * Example: 15000 → "+$ 1.500", -5000 → "-$ 500"
 */
export function formatCOPSigned(amountCOP: number): string {
  const sign = getCurrencySign(amountCOP);
  return `${sign}${formatCOPAbsolute(amountCOP)}`;
}
