/**
 * Format number as Nigerian Naira currency
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted currency string (e.g., "₦1,234.56")
 */
export function formatCurrency(
  amount: number | string,
  options: {
    showDecimals?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return '₦0';
  }

  const {
    showDecimals = true,
    minimumFractionDigits = showDecimals ? 2 : 0,
    maximumFractionDigits = showDecimals ? 2 : 0,
  } = options;

  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(numAmount);
}

/**
 * Format number as Nigerian Naira without currency symbol (for display with custom symbol)
 * @param amount - The amount to format
 * @returns Formatted number string (e.g., "1,234.56")
 */
export function formatAmount(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return '0';
  }

  return new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
}

