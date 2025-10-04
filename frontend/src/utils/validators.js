export function required(value) {
  return value !== undefined && value !== null && String(value).trim() !== ''
}

export function positiveNumber(value) {
  const n = Number(value)
  return !isNaN(n) && n > 0
}
