// Placeholder OCR service. In production, integrate with a real OCR provider.
export async function parseReceipt(imageBase64) {
  // Simulate OCR output
  return {
    amount: 42.5,
    currency: 'USD',
    category: 'Meals',
    description: 'Receipt parsed via OCR',
    date: new Date().toISOString(),
  };
}
