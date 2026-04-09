// State centroids (lat/lon), FIPS codes, and pre-fetched NREL GHI values (kWh/m²/day)
// GHI values sourced from NREL National Solar Radiation Database state averages
const BASE_STATE_METADATA = [
  { abbr: 'AL', fips: '01', name: 'Alabama',              lat: 32.8,  lon: -86.8,  ghi: 4.92 },
  { abbr: 'AK', fips: '02', name: 'Alaska',               lat: 64.2,  lon: -153.4, ghi: 2.80 },
  { abbr: 'AZ', fips: '04', name: 'Arizona',              lat: 34.3,  lon: -111.1, ghi: 5.93 },
  { abbr: 'AR', fips: '05', name: 'Arkansas',             lat: 34.8,  lon: -92.2,  ghi: 4.75 },
  { abbr: 'CA', fips: '06', name: 'California',           lat: 36.7,  lon: -119.4, ghi: 5.61 },
  { abbr: 'CO', fips: '08', name: 'Colorado',             lat: 39.0,  lon: -105.5, ghi: 5.37 },
  { abbr: 'CT', fips: '09', name: 'Connecticut',          lat: 41.6,  lon: -72.7,  ghi: 4.16 },
  { abbr: 'DE', fips: '10', name: 'Delaware',             lat: 39.0,  lon: -75.5,  ghi: 4.35 },
  { abbr: 'FL', fips: '12', name: 'Florida',              lat: 27.8,  lon: -81.5,  ghi: 5.26 },
  { abbr: 'GA', fips: '13', name: 'Georgia',              lat: 32.7,  lon: -83.4,  ghi: 4.99 },
  { abbr: 'HI', fips: '15', name: 'Hawaii',               lat: 20.8,  lon: -157.0, ghi: 5.59 },
  { abbr: 'ID', fips: '16', name: 'Idaho',                lat: 44.4,  lon: -114.5, ghi: 4.70 },
  { abbr: 'IL', fips: '17', name: 'Illinois',             lat: 40.0,  lon: -89.2,  ghi: 4.23 },
  { abbr: 'IN', fips: '18', name: 'Indiana',              lat: 40.3,  lon: -86.1,  ghi: 4.17 },
  { abbr: 'IA', fips: '19', name: 'Iowa',                 lat: 42.0,  lon: -93.2,  ghi: 4.38 },
  { abbr: 'KS', fips: '20', name: 'Kansas',               lat: 38.5,  lon: -98.4,  ghi: 5.05 },
  { abbr: 'KY', fips: '21', name: 'Kentucky',             lat: 37.5,  lon: -85.3,  ghi: 4.28 },
  { abbr: 'LA', fips: '22', name: 'Louisiana',            lat: 31.2,  lon: -91.8,  ghi: 4.93 },
  { abbr: 'ME', fips: '23', name: 'Maine',                lat: 45.4,  lon: -69.0,  ghi: 3.99 },
  { abbr: 'MD', fips: '24', name: 'Maryland',             lat: 39.1,  lon: -76.8,  ghi: 4.40 },
  { abbr: 'MA', fips: '25', name: 'Massachusetts',        lat: 42.3,  lon: -71.5,  ghi: 4.10 },
  { abbr: 'MI', fips: '26', name: 'Michigan',             lat: 44.3,  lon: -85.4,  ghi: 3.87 },
  { abbr: 'MN', fips: '27', name: 'Minnesota',            lat: 46.4,  lon: -93.1,  ghi: 4.20 },
  { abbr: 'MS', fips: '28', name: 'Mississippi',          lat: 32.7,  lon: -89.7,  ghi: 4.91 },
  { abbr: 'MO', fips: '29', name: 'Missouri',             lat: 38.5,  lon: -92.5,  ghi: 4.57 },
  { abbr: 'MT', fips: '30', name: 'Montana',              lat: 47.0,  lon: -109.6, ghi: 4.73 },
  { abbr: 'NE', fips: '31', name: 'Nebraska',             lat: 41.5,  lon: -99.9,  ghi: 4.88 },
  { abbr: 'NV', fips: '32', name: 'Nevada',               lat: 39.3,  lon: -116.6, ghi: 6.01 },
  { abbr: 'NH', fips: '33', name: 'New Hampshire',        lat: 43.7,  lon: -71.6,  ghi: 4.00 },
  { abbr: 'NJ', fips: '34', name: 'New Jersey',           lat: 40.1,  lon: -74.5,  ghi: 4.36 },
  { abbr: 'NM', fips: '35', name: 'New Mexico',           lat: 34.5,  lon: -106.1, ghi: 6.08 },
  { abbr: 'NY', fips: '36', name: 'New York',             lat: 42.9,  lon: -75.5,  ghi: 3.97 },
  { abbr: 'NC', fips: '37', name: 'North Carolina',       lat: 35.6,  lon: -79.4,  ghi: 4.71 },
  { abbr: 'ND', fips: '38', name: 'North Dakota',         lat: 47.5,  lon: -100.5, ghi: 4.52 },
  { abbr: 'OH', fips: '39', name: 'Ohio',                 lat: 40.4,  lon: -82.8,  ghi: 4.00 },
  { abbr: 'OK', fips: '40', name: 'Oklahoma',             lat: 35.6,  lon: -97.5,  ghi: 5.17 },
  { abbr: 'OR', fips: '41', name: 'Oregon',               lat: 43.8,  lon: -120.6, ghi: 4.22 },
  { abbr: 'PA', fips: '42', name: 'Pennsylvania',         lat: 40.9,  lon: -77.8,  ghi: 4.08 },
  { abbr: 'RI', fips: '44', name: 'Rhode Island',         lat: 41.7,  lon: -71.5,  ghi: 4.14 },
  { abbr: 'SC', fips: '45', name: 'South Carolina',       lat: 33.9,  lon: -80.9,  ghi: 4.97 },
  { abbr: 'SD', fips: '46', name: 'South Dakota',         lat: 44.4,  lon: -100.2, ghi: 4.73 },
  { abbr: 'TN', fips: '47', name: 'Tennessee',            lat: 35.9,  lon: -86.4,  ghi: 4.50 },
  { abbr: 'TX', fips: '48', name: 'Texas',                lat: 31.1,  lon: -99.3,  ghi: 5.49 },
  { abbr: 'UT', fips: '49', name: 'Utah',                 lat: 39.3,  lon: -111.1, ghi: 5.56 },
  { abbr: 'VT', fips: '50', name: 'Vermont',              lat: 44.1,  lon: -72.7,  ghi: 3.97 },
  { abbr: 'VA', fips: '51', name: 'Virginia',             lat: 37.8,  lon: -78.2,  ghi: 4.47 },
  { abbr: 'WA', fips: '53', name: 'Washington',           lat: 47.4,  lon: -120.5, ghi: 3.84 },
  { abbr: 'WV', fips: '54', name: 'West Virginia',        lat: 38.6,  lon: -80.6,  ghi: 4.00 },
  { abbr: 'WI', fips: '55', name: 'Wisconsin',            lat: 44.3,  lon: -89.8,  ghi: 4.03 },
  { abbr: 'WY', fips: '56', name: 'Wyoming',              lat: 43.0,  lon: -107.6, ghi: 5.19 },
  { abbr: 'DC', fips: '11', name: 'District of Columbia', lat: 38.9,  lon: -77.0,  ghi: 4.37 },
]

// Approximate annual average wind speed at 100m (m/s) by state.
// Source basis: NREL Wind Toolkit state-level patterns, simplified for dashboard use.
const WIND_SPEED_BY_ABBR = {
  AL: 5.3, AK: 6.8, AZ: 5.9, AR: 5.5, CA: 6.1, CO: 6.9, CT: 5.2, DE: 5.8,
  FL: 5.1, GA: 5.0, HI: 6.7, ID: 6.2, IL: 6.6, IN: 6.2, IA: 7.2, KS: 7.8,
  KY: 5.7, LA: 5.4, ME: 6.3, MD: 5.7, MA: 5.9, MI: 6.5, MN: 7.1, MS: 5.2,
  MO: 6.3, MT: 7.5, NE: 7.6, NV: 6.4, NH: 5.7, NJ: 5.8, NM: 6.8, NY: 6.0,
  NC: 5.6, ND: 8.0, OH: 5.9, OK: 7.7, OR: 6.6, PA: 5.8, RI: 6.0, SC: 5.2,
  SD: 7.8, TN: 5.4, TX: 7.1, UT: 6.3, VT: 5.8, VA: 5.6, WA: 6.5, WV: 5.5,
  WI: 6.6, WY: 7.9, DC: 5.3,
}

function windCfFromSpeed(speed) {
  if (speed < 5.5) return 0.25
  if (speed < 6.5) return 0.30
  if (speed < 7.5) return 0.35
  return 0.42
}

export const STATE_METADATA = BASE_STATE_METADATA.map((state) => {
  const windSpeed = WIND_SPEED_BY_ABBR[state.abbr] ?? 5.5
  return {
    ...state,
    windSpeed,
    windCF: windCfFromSpeed(windSpeed),
  }
})

// Quick lookup maps
export const FIPS_TO_STATE = Object.fromEntries(STATE_METADATA.map((s) => [s.fips, s]))
export const ABBR_TO_STATE = Object.fromEntries(STATE_METADATA.map((s) => [s.abbr, s]))
