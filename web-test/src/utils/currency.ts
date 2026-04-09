export function formatCOP(amountCOP: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amountCOP);
}

export function formatCOPCompact(amountCOP: number): string {
  const abs = Math.abs(amountCOP);
  if (abs >= 1_000_000) {
    const m = amountCOP / 1_000_000;
    return `$ ${m.toFixed(m % 1 === 0 ? 0 : 1)}M`;
  }
  if (abs >= 1_000) {
    const k = amountCOP / 1_000;
    return `$ ${k.toFixed(k % 1 === 0 ? 0 : 1)}K`;
  }
  return formatCOP(amountCOP);
}
