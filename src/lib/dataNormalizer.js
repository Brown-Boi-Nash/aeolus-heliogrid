// Convert EIA retail price rows → { price in $/kWh, period }[]
export function normalizeEiaPriceSeries(rows) {
  return rows
    .map((row) => ({
      period: row.period,
      price: row.price != null ? parseFloat(row.price) / 100 : null, // cents → dollars
    }))
    .filter((r) => r.price != null)
    .sort((a, b) => a.period.localeCompare(b.period))
}

// Get most recent national average price ($/kWh)
export function extractNationalPrice(rows) {
  if (!rows.length) return null
  const sorted = [...rows].sort((a, b) => b.period.localeCompare(a.period))
  const val = parseFloat(sorted[0].price)
  return isNaN(val) ? null : val / 100
}

// Convert annual capacity rows → { year, capacityGW }[]
export function normalizeCapacitySeries(rows) {
  return rows
    .map((row) => ({
      year: String(row.period),
      capacityGW: row.capability != null
        ? parseFloat(row.capability) / 1000
        : row.capacity != null
          ? parseFloat(row.capacity) / 1000
          : null, // MW → GW
    }))
    .filter((r) => r.capacityGW != null)
    .sort((a, b) => a.year.localeCompare(b.year))
}

// Extract total solar capacity (GW) from most recent annual row
export function extractTotalCapacity(rows) {
  if (!rows.length) return null
  const sorted = [...rows].sort((a, b) => b.period - a.period)
  const val = parseFloat(sorted[0].capability ?? sorted[0].capacity)
  return isNaN(val) ? null : val / 1000
}

// Convert state price rows → { [stateAbbr]: priceInDollars }
export function normalizeStatePrices(rows) {
  const latest = {}
  const sorted = [...rows].sort((a, b) => b.period.localeCompare(a.period))
  for (const row of sorted) {
    const abbr = row.stateid
    if (!abbr || abbr === 'US') continue
    if (!latest[abbr] && row.price != null) {
      latest[abbr] = parseFloat(row.price) / 100
    }
  }
  return latest
}
