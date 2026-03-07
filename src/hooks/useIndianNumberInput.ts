import type { ChangeEvent } from 'react';

export function useIndianNumberInput(
  value: string,
  onChange: (raw: string) => void
) {
  const formatIndian = (num: string) => {
    const digits = num.replace(/[^0-9]/g, '');
    if (!digits) return '';
    const n = parseInt(digits);
    if (isNaN(n)) return '';
    return n.toLocaleString('en-IN');
  };

  const displayValue = formatIndian(value);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    onChange(raw);
  };

  return { displayValue, handleChange };
}
