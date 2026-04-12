/**
 * Pure financial calculation functions — no React, no side effects.
 * All monetary values in dollars, rates as decimals (0.08 = 8%).
 */

// PMT: fixed periodic payment for a loan
function pmt(rate, nper, pv) {
  if (rate === 0) return pv / nper
  return (pv * rate * Math.pow(1 + rate, nper)) / (Math.pow(1 + rate, nper) - 1)
}

// NPV of a cash flow array at a given rate (CF[0] is Year 0)
function npvAtRate(cashFlows, rate) {
  return cashFlows.reduce((acc, cf, i) => acc + cf / Math.pow(1 + rate, i), 0)
}

/**
 * IRS 5-year MACRS depreciation rates (half-year convention).
 * Applies to solar PV and wind energy property (IRS Rev. Proc. 87-56, Asset Class 00.3).
 * Six periods due to the half-year convention on the final year.
 *
 * Depreciable basis = CapEx × (1 − 0.5 × ITC_rate)
 *   Example with 30% ITC: basis = CapEx × 0.85  (IRS §168(k) basis adjustment)
 *
 * Annual tax shield = depreciable_basis × MACRS_rate[n] × corporate_tax_rate
 */
const MACRS_5YR = [0.20, 0.32, 0.192, 0.1152, 0.1152, 0.0576]

/**
 * Build annual cash flow array from calculator inputs.
 * Index 0 = Year 0 (equity outflow, net of ITC)
 * Index 1..N = Year 1..projectLifeYears
 *
 * When useMacrs is true, MACRS depreciation tax shields are added to
 * years 1–6. The depreciable basis is reduced by 50% of the ITC per IRS rules.
 */
export function buildCashFlows(inputs) {
  const {
    systemSizeKW,
    capacityFactor,
    degradationRate,
    installCostPerW,
    omCostPerKWPerYear,
    electricityRate,
    escalationRate,
    debtFraction,
    interestRate,
    loanTermYears,
    projectLifeYears,
    itcPercent,
    useMacrs = false,
    corporateTaxRate = 0.21,
    ppaMode = false,
  } = inputs

  // PPA mode: utility-scale projects sell at ~75% of retail rate via long-term PPA contract
  const effectiveRate    = ppaMode ? electricityRate * 0.75 : electricityRate
  const capex            = systemSizeKW * 1000 * installCostPerW
  const itcBenefit       = capex * itcPercent
  const loanAmount       = capex * debtFraction
  const equityOut        = capex * (1 - debtFraction) - itcBenefit
  const annualDebtService = pmt(interestRate, loanTermYears, loanAmount)

  // IRS §168(k): depreciable basis reduced by 50% of ITC claimed
  const depreciableBasis = useMacrs ? capex * (1 - 0.5 * itcPercent) : 0

  const cashFlows = [-(equityOut)]

  for (let n = 1; n <= projectLifeYears; n++) {
    const degradationFactor = Math.pow(1 - degradationRate, n - 1)
    const escalationFactor  = Math.pow(1 + escalationRate, n - 1)

    const energyKWh  = systemSizeKW * 8760 * capacityFactor * degradationFactor
    const revenue    = energyKWh * effectiveRate * escalationFactor
    const omCost     = systemSizeKW * omCostPerKWPerYear * escalationFactor
    const debtService = n <= loanTermYears ? annualDebtService : 0

    // MACRS tax shield: depreciation deduction × tax rate (years 1–6 only)
    const macrsRate      = useMacrs && n <= MACRS_5YR.length ? MACRS_5YR[n - 1] : 0
    const macrsTaxShield = depreciableBasis * macrsRate * corporateTaxRate

    cashFlows.push(revenue - omCost - debtService + macrsTaxShield)
  }

  return cashFlows
}

/**
 * Returns year-by-year MACRS tax shields for display in the cash flow table.
 * Returns an empty array when MACRS is disabled.
 */
export function buildMacrsTaxShields(inputs) {
  const { installCostPerW, systemSizeKW, itcPercent, useMacrs = false, corporateTaxRate = 0.21, projectLifeYears } = inputs
  if (!useMacrs) return Array(projectLifeYears).fill(0)
  const capex            = systemSizeKW * 1000 * installCostPerW
  const depreciableBasis = capex * (1 - 0.5 * itcPercent)
  return Array.from({ length: projectLifeYears }, (_, i) => {
    const rate = i < MACRS_5YR.length ? MACRS_5YR[i] : 0
    return depreciableBasis * rate * corporateTaxRate
  })
}

/**
 * IRR via bisection. Returns decimal (e.g. 0.12 = 12%) or null if not found.
 */
export function calcIRR(cashFlows) {
  const hasPositive = cashFlows.some((cf) => cf > 0)
  const hasNegative = cashFlows.some((cf) => cf < 0)
  if (!hasPositive || !hasNegative) return null

  let lo = -0.5
  let hi = 5.0
  const tolerance = 1e-7
  const maxIter   = 200

  if (npvAtRate(cashFlows, lo) * npvAtRate(cashFlows, hi) > 0) return null

  for (let i = 0; i < maxIter; i++) {
    const mid    = (lo + hi) / 2
    const npvMid = npvAtRate(cashFlows, mid)
    if (Math.abs(npvMid) < tolerance || (hi - lo) / 2 < tolerance) return mid
    if (npvAtRate(cashFlows, lo) * npvMid < 0) { hi = mid } else { lo = mid }
  }
  return (lo + hi) / 2
}

/**
 * NPV at a given discount rate. Returns dollar value.
 */
export function calcNPV(cashFlows, discountRate = 0.08) {
  return npvAtRate(cashFlows, discountRate)
}

/**
 * Simple payback period in years (undiscounted).
 * Returns null if never paid back within cash flow array.
 */
export function calcPayback(cashFlows) {
  const equity = Math.abs(cashFlows[0])
  let cumulative = 0
  for (let i = 1; i < cashFlows.length; i++) {
    const prev = cumulative
    cumulative += cashFlows[i]
    if (cumulative >= equity) {
      return (i - 1) + (equity - prev) / cashFlows[i]
    }
  }
  return null
}

/**
 * After-tax LCOE in $/kWh.
 * When MACRS is enabled, depreciation tax shields reduce net costs in years 1–6,
 * producing a lower (more accurate) after-tax LCOE.
 *
 * LCOE = (CapEx + PV[O&M] − PV[MACRS tax shields]) / PV[energy output]
 */
export function calcLCOE(inputs) {
  const {
    systemSizeKW,
    capacityFactor,
    degradationRate,
    installCostPerW,
    omCostPerKWPerYear,
    escalationRate,
    projectLifeYears,
    discountRate = 0.08,
    useMacrs = false,
    corporateTaxRate = 0.21,
    itcPercent = 0,
    // ppaMode does not affect LCOE (cost-side metric, not revenue-side)
  } = inputs

  const capex            = systemSizeKW * 1000 * installCostPerW
  const depreciableBasis = useMacrs ? capex * (1 - 0.5 * itcPercent) : 0

  let discountedCost   = capex
  let discountedEnergy = 0

  for (let n = 1; n <= projectLifeYears; n++) {
    const degradationFactor = Math.pow(1 - degradationRate, n - 1)
    const escalationFactor  = Math.pow(1 + escalationRate, n - 1)
    const discount          = Math.pow(1 + discountRate, n)

    const energyKWh      = systemSizeKW * 8760 * capacityFactor * degradationFactor
    const omCost         = systemSizeKW * omCostPerKWPerYear * escalationFactor
    const macrsRate      = useMacrs && n <= MACRS_5YR.length ? MACRS_5YR[n - 1] : 0
    const macrsTaxShield = depreciableBasis * macrsRate * corporateTaxRate

    discountedCost   += (omCost - macrsTaxShield) / discount
    discountedEnergy += energyKWh / discount
  }

  return discountedEnergy > 0 ? discountedCost / discountedEnergy : null
}

/**
 * Build a year-by-year debt amortization schedule.
 * Returns an empty array when debtFraction is 0.
 *
 * Each row: { year, beginBalance, interest, principal, payment, endBalance, macrsShield }
 */
export function buildDebtSchedule(inputs) {
  const {
    systemSizeKW,
    installCostPerW,
    debtFraction,
    interestRate,
    loanTermYears,
    itcPercent   = 0,
    useMacrs     = false,
    corporateTaxRate = 0.21,
  } = inputs

  if (!debtFraction || debtFraction <= 0) return []

  const capex            = systemSizeKW * 1000 * installCostPerW
  const loanAmount       = capex * debtFraction
  const payment          = pmt(interestRate, loanTermYears, loanAmount)
  const depreciableBasis = useMacrs ? capex * (1 - 0.5 * itcPercent) : 0

  const schedule = []
  let balance = loanAmount

  for (let n = 1; n <= loanTermYears; n++) {
    const interest    = balance * interestRate
    const principal   = payment - interest
    const endBalance  = Math.max(0, balance - principal)
    const macrsRate   = useMacrs && n <= MACRS_5YR.length ? MACRS_5YR[n - 1] : 0
    const macrsShield = depreciableBasis * macrsRate * corporateTaxRate

    schedule.push({ year: n, beginBalance: balance, interest, principal, payment, endBalance, macrsShield })
    balance = endBalance
  }

  return schedule
}

/**
 * Apply scenario multipliers to inputs before calculation.
 */
export function applyScenario(inputs, multipliers) {
  return {
    ...inputs,
    capacityFactor:  inputs.capacityFactor  * multipliers.capacityFactor,
    electricityRate: inputs.electricityRate * multipliers.electricityRate,
    installCostPerW: inputs.installCostPerW * multipliers.installCostPerW,
  }
}

/**
 * Run all calculations and return a results object.
 */
export function runCalculations(inputs) {
  const cashFlows = buildCashFlows(inputs)
  const irr       = calcIRR(cashFlows)
  const npv       = calcNPV(cashFlows, inputs.discountRate ?? 0.08)
  const payback   = calcPayback(cashFlows)
  const lcoe      = calcLCOE(inputs)
  return { cashFlows, irr, npv, payback, lcoe }
}
