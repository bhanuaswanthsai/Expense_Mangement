import { asyncHandler } from '../utils/errorHandler.js'
import { parseReceipt } from '../utils/ocrService.js'

export const parse = asyncHandler(async (req, res) => {
  const { receiptBase64 } = req.body
  if (!receiptBase64) return res.status(400).json({ message: 'receiptBase64 is required' })
  const data = await parseReceipt(receiptBase64)
  res.json(data)
})
