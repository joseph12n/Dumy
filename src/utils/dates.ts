/**
 * Date utilities with Spanish (es-CO) locale
 * All dates are stored as ISO 8601 strings
 */

export const ES_CO_LOCALE = "es-CO" as const;

/**
 * Get today's date as ISO string (YYYY-MM-DD)
 */
export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Get current timestamp as ISO string (full ISO 8601)
 */
export function nowISO(): string {
  return new Date().toISOString();
}

/**
 * Format ISO date to display string in Spanish
 * Example: '2025-04-08' → 'martes, 8 de abril de 2025'
 */
export function formatDateDisplay(isoDate: string): string {
  const date = new Date(isoDate + "T00:00:00Z"); // Add time to avoid timezone issues
  return new Intl.DateTimeFormat("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/**
 * Format ISO date to short display
 * Example: '2025-04-08' → '8 abr'
 */
export function formatDateShort(isoDate: string): string {
  const date = new Date(isoDate + "T00:00:00Z");
  return new Intl.DateTimeFormat("es-CO", {
    month: "short",
    day: "numeric",
  }).format(date);
}

/**
 * Format ISO date to month and year
 * Example: '2025-04-08' → 'abril 2025'
 */
export function formatMonthYear(isoDate: string): string {
  const date = new Date(isoDate + "T00:00:00Z");
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "long",
  }).format(date);
}

/**
 * Get the first and last day of a month as ISO dates
 */
export function getMonthRange(
  year: number,
  month: number,
): { from: string; to: string } {
  const from = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const to = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { from, to };
}

/**
 * Get Monday-Sunday range containing the given date
 */
export function getWeekRange(date: Date): { from: string; to: string } {
  const dayOfWeek = date.getDay();
  const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for Monday start

  const monday = new Date(date.setDate(diff));
  const sunday = new Date(monday.getTime() + 6 * 24 * 60 * 60 * 1000);

  const from = monday.toISOString().split("T")[0];
  const to = sunday.toISOString().split("T")[0];

  return { from, to };
}

/**
 * Get the first and last day of the previous month
 */
export function getPreviousMonthRange(
  year: number,
  month: number,
): { from: string; to: string } {
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  return getMonthRange(prevYear, prevMonth);
}

/**
 * Get the number of days in a month
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Get the number of days that have elapsed in a month
 */
export function getDaysElapsedInMonth(
  year: number,
  month: number,
  today: Date,
): number {
  if (today.getFullYear() === year && today.getMonth() + 1 === month) {
    return today.getDate();
  }
  return getDaysInMonth(year, month);
}

/**
 * Check if two ISO dates represent the same day
 */
export function isSameDay(a: string, b: string): boolean {
  return a.split("T")[0] === b.split("T")[0];
}

/**
 * Get relative time label in Spanish
 * Example: 'hace 5 minutos', 'ayer', 'hace 2 semanas'
 */
export function getRelativeTimeLabel(isoTimestamp: string): string {
  if (!isoTimestamp || typeof isoTimestamp !== "string") {
    return "ahora";
  }

  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) {
    return "ahora";
  }

  const now = new Date();
  const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const seconds = Math.abs(diffSeconds);
  const isFuture = diffSeconds < 0;

  if (seconds < 5) return "ahora";

  const formatLabel = (value: number, unit: string) => {
    const plural = value === 1 ? unit : `${unit}s`;
    return isFuture ? `en ${value} ${plural}` : `hace ${value} ${plural}`;
  };

  if (seconds < 60) {
    return formatLabel(seconds, "segundo");
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return formatLabel(minutes, "minuto");
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return formatLabel(hours, "hora");
  }

  const days = Math.floor(hours / 24);
  if (days < 30) {
    return formatLabel(days, "dia");
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return formatLabel(months, "mes");
  }

  const years = Math.floor(days / 365);
  return formatLabel(years, "ano");
}

/**
 * Parse ISO date and return Date object (handles timezone correctly)
 */
export function parseISODate(isoDate: string): Date {
  return new Date(isoDate + "T00:00:00Z");
}
