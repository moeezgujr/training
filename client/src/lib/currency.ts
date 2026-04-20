import { supportedCurrencies, currencyInfo, type SupportedCurrency } from "@shared/schema";

/**
 * Format a price with currency symbol and proper decimal places
 */
export function formatCurrency(amount: number | string, currency: SupportedCurrency): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  const info = currencyInfo[currency];
  
  if (isNaN(numericAmount)) {
    return `${info.symbol}0${info.decimals > 0 ? '.00' : ''}`;
  }

  // Format with proper decimals
  const formatted = numericAmount.toFixed(info.decimals);
  
  // Add currency symbol
  return `${info.symbol}${formatted}`;
}

/**
 * Get currency options for select components
 */
export function getCurrencyOptions() {
  return supportedCurrencies.map(currency => ({
    value: currency,
    label: `${currency} - ${currencyInfo[currency].name}`,
    symbol: currencyInfo[currency].symbol
  }));
}

/**
 * Parse a currency string to number
 */
export function parseCurrencyString(value: string): number {
  // Remove currency symbols and parse
  const cleaned = value.replace(/[^\d.,]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}

/**
 * Validate currency amount
 */
export function validateCurrencyAmount(amount: string | number, currency: SupportedCurrency): boolean {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount) || numericAmount < 0) {
    return false;
  }
  
  // Check decimal places
  const info = currencyInfo[currency];
  if (info.decimals === 0) {
    return Number.isInteger(numericAmount);
  }
  
  return true;
}

/**
 * Get popular currencies for quick selection
 */
export function getPopularCurrencies(): SupportedCurrency[] {
  return ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];
}

/**
 * Convert price input to database format
 */
export function formatPriceForDatabase(amount: string | number): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return isNaN(numericAmount) ? '0.00' : numericAmount.toFixed(2);
}