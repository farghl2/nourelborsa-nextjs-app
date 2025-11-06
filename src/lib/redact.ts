export type RedactableStock = Record<string, any>

export function redactStock<T extends RedactableStock>(stock: T, subscribed: boolean): T {
  if (subscribed) return stock
  return {
    ...stock,
    recommendation: null,
    durationDays: null,
    returnOnPrice: null,
    fairValue: null,
    earningsPerShare: null,
    expectedFairValueNextYear: null,
    expectedEarningsPerShare: null,
  }
}
