/**
 * ESG impact calculation utilities.
 * Sources: EPA eGRID 2022, EIA, EPA
 */

// EPA eGRID 2022 approximate emission factors (kg CO₂e / kWh) by state
export const EMISSION_FACTORS = {
  AL: 0.468, AK: 0.453, AZ: 0.357, AR: 0.489, CA: 0.207,
  CO: 0.562, CT: 0.196, DE: 0.421, FL: 0.432, GA: 0.436,
  HI: 0.638, ID: 0.098, IL: 0.371, IN: 0.621, IA: 0.469,
  KS: 0.512, KY: 0.674, LA: 0.497, ME: 0.175, MD: 0.340,
  MA: 0.234, MI: 0.492, MN: 0.386, MS: 0.452, MO: 0.593,
  MT: 0.372, NE: 0.512, NV: 0.320, NH: 0.185, NJ: 0.257,
  NM: 0.549, NY: 0.216, NC: 0.390, ND: 0.598, OH: 0.540,
  OK: 0.468, OR: 0.109, PA: 0.387, RI: 0.268, SC: 0.325,
  SD: 0.220, TN: 0.395, TX: 0.422, UT: 0.609, VT: 0.014,
  VA: 0.333, WA: 0.086, WV: 0.752, WI: 0.498, WY: 0.712,
  DC: 0.340,
}

export const US_AVG_EMISSION = 0.386  // kg CO₂e / kWh
export const KWH_PER_HOME    = 10_500 // EIA: average US household annual consumption
export const TONNES_PER_CAR  = 4.6   // EPA: average passenger car annual CO₂ equivalent

/**
 * Compute ESG metrics and grade from project inputs + state emission factor.
 *
 * Grade factors (100 pts total):
 *   40 pts — Capacity factor quality  (CF / 0.45 max)
 *   30 pts — Grid decarbonization impact (state emission factor / 0.80 max)
 *   20 pts — Project scale efficiency (bonus for utility-scale ≥ 1 MW)
 *   10 pts — Federal incentive captured (ITC > 0)
 *
 * @param {{ systemSizeKW: number, capacityFactor: number, itcPercent: number }} inputs
 * @param {string} [stateAbbr]
 * @returns {{ co2Tonnes: number, carsEquivalent: number, homesPowered: number, grade: string, label: string, score: number }}
 */
export function computeEsg(inputs, stateAbbr) {
  const { systemSizeKW, capacityFactor, itcPercent } = inputs
  const emissionFactor = EMISSION_FACTORS[stateAbbr] ?? US_AVG_EMISSION

  const annualKWh      = systemSizeKW * 8_760 * capacityFactor
  const co2Tonnes      = (annualKWh * emissionFactor) / 1_000
  const carsEquivalent = Math.round(co2Tonnes / TONNES_PER_CAR)
  const homesPowered   = Math.round(annualKWh / KWH_PER_HOME)

  const cfScore    = Math.min(capacityFactor / 0.45, 1) * 40
  const gridScore  = Math.min(emissionFactor / 0.80, 1) * 30
  const scaleScore = systemSizeKW >= 1_000 ? 20 : systemSizeKW >= 100 ? 12 : 6
  const itcScore   = itcPercent > 0 ? 10 : 0
  const total      = cfScore + gridScore + scaleScore + itcScore

  let grade, label
  if      (total >= 85) { grade = 'A+'; label = 'Exceptional' }
  else if (total >= 75) { grade = 'A';  label = 'Excellent'   }
  else if (total >= 65) { grade = 'B+'; label = 'Strong'      }
  else if (total >= 55) { grade = 'B';  label = 'Good'        }
  else                  { grade = 'C+'; label = 'Developing'  }

  return { co2Tonnes, carsEquivalent, homesPowered, grade, label, score: Math.round(total) }
}
