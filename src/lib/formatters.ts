/**
 * Formats a number as a currency string with the ruble symbol (₽).
 * @param amount - The number to format.
 * @returns A formatted string, e.g., "1 000 ₽".
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' ₽';
}
