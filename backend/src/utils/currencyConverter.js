import axios from 'axios';

const ALIAS_MAP = {
  // India
  'INR': 'INR', 'IND': 'INR', 'INDIA': 'INR', 'IN': 'INR', 'RUPEE': 'INR', 'RUPEES': 'INR', '₹': 'INR',
  // United States
  'USD': 'USD', 'US': 'USD', 'USA': 'USD', 'DOLLAR': 'USD', 'DOLLARS': 'USD', '$': 'USD',
  // Euro
  'EUR': 'EUR', 'EU': 'EUR', 'EURO': 'EUR', '€': 'EUR',
  // United Kingdom
  'GBP': 'GBP', 'UK': 'GBP', 'GB': 'GBP', 'POUND': 'GBP', 'POUNDS': 'GBP', '£': 'GBP',
  // China
  'CNY': 'CNY', 'CN': 'CNY', 'RMB': 'CNY', 'YUAN': 'CNY',
  // Japan
  'JPY': 'JPY', 'JP': 'JPY', 'YEN': 'JPY', '¥': 'JPY',
  // UAE
  'AED': 'AED', 'AE': 'AED', 'UAE': 'AED', 'DIRHAM': 'AED',
  // Canada
  'CAD': 'CAD', 'CA': 'CAD',
  // Australia
  'AUD': 'AUD', 'AU': 'AUD',
  // Others common
  'SGD': 'SGD', 'SG': 'SGD', 'CHF': 'CHF', 'SEK': 'SEK', 'NOK': 'NOK', 'DKK': 'DKK'
};

// Static emergency cross rates (approximate). Only used if all network calls fail.
// Keep these conservative and easy to adjust.
const STATIC_CROSS = {
  'USD->INR': 83,
  'INR->USD': 1/83,
  'USD->EUR': 0.92,
  'EUR->USD': 1/0.92,
  'USD->GBP': 0.78,
  'GBP->USD': 1/0.78,
};

export function normalizeCurrencyCode(input) {
  const raw = String(input || '').trim().toUpperCase();
  if (!raw) return '';
  // Direct alias map
  if (ALIAS_MAP[raw]) return ALIAS_MAP[raw];
  // If it's a 3-letter code, assume already ISO
  if (/^[A-Z]{3}$/.test(raw)) return raw;
  // Strip non-letters like currency symbols and try again
  const letters = raw.replace(/[^A-Z]/g, '');
  if (ALIAS_MAP[letters]) return ALIAS_MAP[letters];
  if (/^[A-Z]{3}$/.test(letters)) return letters;
  return raw; // last resort
}

export async function convertAmount(amount, fromCurrency, toCurrency) {
  const from = normalizeCurrencyCode(fromCurrency);
  const to = normalizeCurrencyCode(toCurrency);
  if (!from || !to) throw new Error('Invalid currency codes');
  if (from === to) return Number(amount);
  // Primary: exchangerate.host /convert
  try {
    const url = `https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${encodeURIComponent(amount)}`;
    const { data } = await axios.get(url);
    if (data && data.success !== false && typeof data.result === 'number') {
      return Number(data.result);
    }
  } catch (_) { /* fall through to fallback */ }

  // Fallback: exchangerate.host /latest with symbols
  try {
    const latestUrl = `https://api.exchangerate.host/latest?base=${from}&symbols=${to}`;
    const { data } = await axios.get(latestUrl);
    const rate = data?.rates?.[to];
    if (typeof rate === 'number') {
      return Number(amount) * rate;
    }
  } catch (_) { /* give up */ }

  // Final fallback: cross-rate using USD base
  try {
    const url = `https://api.exchangerate.host/latest?base=USD&symbols=${from},${to}`;
    const { data } = await axios.get(url);
    const rateFrom = data?.rates?.[from]; // how many FROM per 1 USD
    const rateTo = data?.rates?.[to];     // how many TO per 1 USD
    if (typeof rateFrom === 'number' && typeof rateTo === 'number' && rateFrom !== 0) {
      // amount (FROM) -> USD -> TO
      const inUsd = Number(amount) / rateFrom;
      return inUsd * rateTo;
    }
  } catch (_) { /* no-op */ }
  // Static last-resort
  const key = `${from}->${to}`;
  if (STATIC_CROSS[key]) {
    return Number(amount) * STATIC_CROSS[key];
  }
  // Graceful fallback: return original amount and let UI show original currency
  console.warn(`[currencyConverter] Falling back to original amount. No conversion for ${from}->${to}`);
  return Number(amount);
}
