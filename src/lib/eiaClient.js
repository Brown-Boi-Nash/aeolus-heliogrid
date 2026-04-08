const EIA_BASE = 'https://api.eia.gov/v2'
const API_KEY = import.meta.env.VITE_EIA_API_KEY

function buildUrl(path, params) {
  const url = new URL(`${EIA_BASE}${path}`)
  url.searchParams.set('api_key', API_KEY)
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.append(k, v)
  }
  return url.toString()
}

// Last 24 months of national average retail electricity price (cents/kWh)
export async function fetchNationalElectricityPrice() {
  const url = buildUrl('/electricity/retail-sales/data/', {
    'frequency': 'monthly',
    'data[0]': 'price',
    'facets[sectorName][]': 'all sectors',
    'facets[stateid][]': 'US',
    'sort[0][column]': 'period',
    'sort[0][direction]': 'desc',
    'length': '24',
  })
  const res = await fetch(url)
  if (!res.ok) throw new Error(`EIA price fetch failed: ${res.status}`)
  const json = await res.json()
  return json?.response?.data ?? []
}

// Annual solar utility-scale installed capacity for last 10 years
export async function fetchSolarCapacityTrend() {
  const url = buildUrl('/electricity/electric-power-operational-data/data/', {
    'frequency': 'annual',
    'data[0]': 'capacity',
    'facets[fueltypeid][]': 'SUN',
    'facets[location][]': 'US',
    'sort[0][column]': 'period',
    'sort[0][direction]': 'desc',
    'length': '10',
  })
  const res = await fetch(url)
  if (!res.ok) throw new Error(`EIA capacity fetch failed: ${res.status}`)
  const json = await res.json()
  return json?.response?.data ?? []
}

// Latest electricity price for every state
export async function fetchStatePrices() {
  const url = buildUrl('/electricity/retail-sales/data/', {
    'frequency': 'annual',
    'data[0]': 'price',
    'facets[sectorName][]': 'all sectors',
    'sort[0][column]': 'period',
    'sort[0][direction]': 'desc',
    'length': '60',
  })
  const res = await fetch(url)
  if (!res.ok) throw new Error(`EIA state prices fetch failed: ${res.status}`)
  const json = await res.json()
  return json?.response?.data ?? []
}
