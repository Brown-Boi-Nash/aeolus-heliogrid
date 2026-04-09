const FRED_KEY = import.meta.env.VITE_FRED_API_KEY
const BASE = 'https://api.stlouisfed.org/fred/series/observations'

async function fetchLatest(seriesId) {
  const url = new URL(BASE)
  url.searchParams.set('series_id', seriesId)
  url.searchParams.set('api_key', FRED_KEY)
  url.searchParams.set('sort_order', 'desc')
  url.searchParams.set('limit', '5') // fetch a few in case latest is missing
  url.searchParams.set('file_type', 'json')

  const res = await fetch(url)
  if (!res.ok) throw new Error(`FRED ${seriesId} fetch failed: ${res.status}`)
  const json = await res.json()

  // Find most recent observation with a real value (not '.')
  const obs = (json?.observations ?? []).find((o) => o.value !== '.')
  return obs ? parseFloat(obs.value) : null
}

/**
 * Fetch three key macro indicators from FRED:
 *   treasury10Y  — DGS10:   10-Year Treasury Constant Maturity Rate (%)
 *   fedFunds     — FEDFUNDS: Federal Funds Effective Rate (%)
 *   breakEvenInflation — T10YIE: 10-Year Breakeven Inflation Rate (%)
 */
export async function fetchFredMacro() {
  const [treasury10Y, fedFunds, breakEvenInflation] = await Promise.all([
    fetchLatest('DGS10'),
    fetchLatest('FEDFUNDS'),
    fetchLatest('T10YIE'),
  ])
  return { treasury10Y, fedFunds, breakEvenInflation }
}
