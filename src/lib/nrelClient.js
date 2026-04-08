const NREL_BASE = 'https://developer.nrel.gov/api'
const API_KEY = import.meta.env.VITE_NREL_API_KEY

// Fetch PVWatts capacity factor for a given lat/lon (1 kW reference system)
export async function fetchPVWatts(lat, lon) {
  const url = new URL(`${NREL_BASE}/pvwatts/v8.json`)
  url.searchParams.set('api_key', API_KEY)
  url.searchParams.set('system_capacity', '1')
  url.searchParams.set('module_type', '0')
  url.searchParams.set('losses', '14')
  url.searchParams.set('array_type', '1')
  url.searchParams.set('tilt', '20')
  url.searchParams.set('azimuth', '180')
  url.searchParams.set('lat', lat)
  url.searchParams.set('lon', lon)
  // timeframe omitted — annual totals (capacity_factor, ac_annual) are always returned

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`NREL PVWatts fetch failed: ${res.status}`)
  const json = await res.json()
  return {
    capacityFactor: json?.outputs?.capacity_factor != null
      ? json.outputs.capacity_factor / 100
      : null,
    acAnnualKWh: json?.outputs?.ac_annual ?? null,
  }
}

// Fetch solar resource (GHI) for a given lat/lon
export async function fetchSolarResource(lat, lon) {
  const url = new URL(`${NREL_BASE}/solar/solar_resource/v1.json`)
  url.searchParams.set('api_key', API_KEY)
  url.searchParams.set('lat', lat)
  url.searchParams.set('lon', lon)

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`NREL solar resource fetch failed: ${res.status}`)
  const json = await res.json()
  return {
    ghi: json?.outputs?.avg_ghi?.annual ?? null,
    dni: json?.outputs?.avg_dni?.annual ?? null,
  }
}
