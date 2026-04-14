/**
 * Receipt Parser - Extracts structured financial data from OCR text.
 *
 * Optimised for Colombian receipts:
 *  - COP values use dot as thousands separator: $150.000
 *  - Tax label is IVA (19% standard)
 *  - Common totals: "TOTAL", "TOTAL A PAGAR", "VLR TOTAL"
 */

import { ReceiptData, ReceiptLineItem } from "../../store/types";

/* ------------------------------------------------------------------ */
/*  Monetary value detection                                          */
/* ------------------------------------------------------------------ */

/**
 * Regex patterns for COP values commonly found in Colombian receipts.
 * Captures groups that can be parsed into numbers.
 *
 * Examples matched:
 *  $150.000   150.000   $ 150,000   150000   $1.250.000
 */
const MONEY_PATTERNS = [
  /\$\s?([\d]{1,3}(?:[.,]\d{3})*)/g, // $150.000 or $ 150,000
  /(?<!\d)([\d]{1,3}(?:\.\d{3})+)(?!\d)/g, // 150.000 without $
  /(?<!\d)([\d]{4,10})(?!\d)/g, // plain integer ≥ 1000
];

function parseCOPValue(raw: string): number {
  const cleaned = raw.replace(/[$\s]/g, "").replace(/\./g, "").replace(/,/g, "");
  const value = parseInt(cleaned, 10);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function extractMoneyValues(line: string): number[] {
  const values: number[] = [];
  for (const pattern of MONEY_PATTERNS) {
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(line)) !== null) {
      const v = parseCOPValue(match[1] ?? match[0]);
      if (v >= 100) values.push(v); // ignore tiny noise
    }
  }
  return [...new Set(values)];
}

/* ------------------------------------------------------------------ */
/*  Label / keyword detection                                         */
/* ------------------------------------------------------------------ */

const TOTAL_LABELS = [
  "total a pagar",
  "total pagar",
  "vlr total",
  "valor total",
  "total",
  "gran total",
  "neto a pagar",
];
const SUBTOTAL_LABELS = ["subtotal", "sub total", "sub-total", "base"];
const TAX_LABELS = ["iva", "impuesto", "imp", "iva 19", "iva19"];
const DATE_PATTERN =
  /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})|(\d{4}[/-]\d{1,2}[/-]\d{1,2})/;

function matchesLabel(line: string, labels: string[]): boolean {
  const lower = line.toLowerCase();
  return labels.some((l) => lower.includes(l));
}

function extractDate(text: string): string | null {
  const match = DATE_PATTERN.exec(text);
  if (!match) return null;
  const raw = match[0];
  const parts = raw.split(/[/-]/);
  if (parts.length !== 3) return null;

  let year: string;
  let month: string;
  let day: string;

  if (parts[0].length === 4) {
    [year, month, day] = parts;
  } else if (parts[2].length === 4) {
    [day, month, year] = parts;
  } else {
    [day, month, year] = parts;
    year = `20${year}`;
  }

  const y = parseInt(year, 10);
  const m = parseInt(month, 10);
  const d = parseInt(day, 10);
  if (y < 2000 || y > 2099 || m < 1 || m > 12 || d < 1 || d > 31) return null;
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/* ------------------------------------------------------------------ */
/*  Public parser                                                     */
/* ------------------------------------------------------------------ */

/**
 * Parse raw OCR text into structured receipt data.
 */
export function parseReceipt(rawText: string): ReceiptData {
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  let total: number | null = null;
  let subtotal: number | null = null;
  let tax: number | null = null;
  let vendor: string | null = null;
  const items: ReceiptLineItem[] = [];
  const date = extractDate(rawText);

  // First non-numeric lines are likely the vendor name
  for (const line of lines.slice(0, 4)) {
    if (!/\d{3,}/.test(line) && line.length > 2) {
      vendor = line;
      break;
    }
  }

  for (const line of lines) {
    const moneyValues = extractMoneyValues(line);
    if (moneyValues.length === 0) continue;

    const value = Math.max(...moneyValues);

    if (matchesLabel(line, TOTAL_LABELS) && total === null) {
      total = value;
    } else if (matchesLabel(line, SUBTOTAL_LABELS) && subtotal === null) {
      subtotal = value;
    } else if (matchesLabel(line, TAX_LABELS) && tax === null) {
      tax = value;
    } else {
      // Treat as a line item
      const description = line
        .replace(/\$\s?[\d.,]+/g, "")
        .replace(/[\d.,]{4,}/g, "")
        .trim();
      if (description.length > 1) {
        items.push({ description, amount: value });
      }
    }
  }

  const calculatedSum = items.reduce((s, i) => s + i.amount, 0);

  // Confidence heuristic: higher when we found a total and items
  let confidence = 0.3;
  if (total !== null) confidence += 0.3;
  if (items.length > 0) confidence += 0.2;
  if (vendor) confidence += 0.1;
  if (date) confidence += 0.1;

  return {
    items,
    subtotal,
    tax,
    total,
    calculatedSum,
    date,
    vendor,
    rawText,
    confidence: Math.min(confidence, 1),
  };
}

/**
 * Build a human-readable summary of parsed receipt data (Spanish).
 */
export function summarizeReceipt(data: ReceiptData): string {
  const parts: string[] = [];

  if (data.vendor) {
    parts.push(`Establecimiento: ${data.vendor}`);
  }
  if (data.date) {
    parts.push(`Fecha: ${data.date}`);
  }
  if (data.items.length > 0) {
    parts.push(`Articulos detectados: ${data.items.length}`);
    for (const item of data.items) {
      parts.push(`  - ${item.description}: $${item.amount.toLocaleString("es-CO")}`);
    }
  }
  if (data.subtotal !== null) {
    parts.push(`Subtotal: $${data.subtotal.toLocaleString("es-CO")}`);
  }
  if (data.tax !== null) {
    parts.push(`IVA: $${data.tax.toLocaleString("es-CO")}`);
  }
  if (data.total !== null) {
    parts.push(`Total factura: $${data.total.toLocaleString("es-CO")}`);
  }
  parts.push(`Suma calculada de items: $${data.calculatedSum.toLocaleString("es-CO")}`);

  return parts.join("\n");
}
