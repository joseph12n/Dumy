import { formatCOP } from '../utils/currency';

interface CurrencyDisplayProps {
  amount: number;
  type?: 'normal' | 'compact' | 'signed';
  className?: string;
}

export default function CurrencyDisplay({ amount, type = 'normal', className = '' }: CurrencyDisplayProps) {
  let display = formatCOP(amount);

  if (type === 'signed') {
    const sign = amount >= 0 ? '+' : '-';
    display = `${sign}${formatCOP(Math.abs(amount))}`;
  }

  return <span className={`currency ${className}`}>{display}</span>;
}
