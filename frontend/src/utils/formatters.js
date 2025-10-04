export function formatCurrency(amount, currency = 'USD') {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(Number(amount))
  } catch {
    return Number(amount).toFixed(2) + ' ' + currency
  }
}
