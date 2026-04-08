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
 * Build annual cash flow array from calculator inputs.
 * Index 0 = Year 0 (equity outflow, net of ITC)
 * Index 1..N = Year 1..projectLifeYears
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
  } = inputs

  const capex = systemSizeKW * 1000 * installCostPerW
  const itcBenefit = capex * itcPercent
  const loanAmount = capex * debtFraction
  const equityOut = capex * (1 - debtFraction) - itcBenefit
  const annualDebtService = pmt(interestRate, loanTermYears, loanAmount)

  const cashFlows = [-(equityOut)]

  for (let n = 1; n <= projectLifeYears; n++) {
    const degradationFactor = Math.pow(1 - degradationRate, n - 1)
    const escalationFactor = Math.pow(1 + escalationRate, n - 1)

    const energyKWh = systemSizeKW * 8760 * capacityFactor * degradationFactor
    const revenue = energyKWh * electricityRate * escalationFactor
    const omCost = systemSizeKW * omCostPerKWPerYear * escalationFactor
    const debtService = n <= loanTermYears ? annualDebtService : 0

    cashFlows.push(revenue - omCost - debtService)
  }

  return cashFlows
}

/**
 * IRR via bisection. Returns decimal (e.g. 0.12 = 12%) or null if not found.
 */
export function calcIRR(cashFlows) {
  // Need at least one sign change
  const hasPositive = cashFlows.some((cf) => cf > 0)
  const hasNegative = cashFlows.some((cf) => cf < 0)
  if (!hasPositive || !hasNegative) return null

  let lo = -0.5
  let hi = 5.0
  const tolerance = 1e-7
  const maxIter = 200

  // Check bounds
  if (npvAtRate(cashFlows, lo) * npvAtRate(cashFlows, hi) > 0) return null

  for (let i = 0; i < maxIter; i++) {
    const mid = (lo + hi) / 2
    const npvMid = npvAtRate(cashFlows, mid)
    if (Math.abs(npvMid) < tolerance || (hi - lo) / 2 < tolerance) return mid
    if (npvAtRate(cashFlows, lo) * npvMid < 0) {
      hi = mid
    } else {
      lo = mid
    }
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
      const fraction = (equity - prev) / cashFlows[i]
      return (i - 1) + fraction
    }
  }
  return null
}

/**
 * LCOE in $/kWh — discounted lifetime cost / discounted lifetime energy
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
  } = inputs

  const capex = systemSizeKW * 1000 * installCostPerW
  let discountedCost = capex
  let discountedEnergy = 0

  for (let n = 1; n <= projectLifeYears; n++) {
    const degradationFactor = Math.pow(1 - degradationRate, n - 1)
    const escalationFactor = Math.pow(1 + escalationRate, n - 1)
    const discount = Math.pow(1 + discountRate, n)

    const energyKWh = systemSizeKW * 8760 * capacityFactor * degradationFactor
    const omCost = systemSizeKW * omCostPerKWPerYear * escalationFactor

    discountedCost += omCost / discount
    discountedEnergy += energyKWh / discount
  }

  return discountedEnergy > 0 ? discountedCost / discountedEnergy : null
}

/**
 * Apply scenario multipliers to inputs before calculation.
 */
export function applyScenario(inputs, multipliers) {
  return {
    ...inputs,
    capacityFactor: inputs.capacityFactor * multipliers.capacityFactor,
    electricityRate: inputs.electricityRate * multipliers.electricityRate,
    installCostPerW: inputs.installCostPerW * multipliers.installCostPerW,
  }
}

/**
 * Run all calculations and return a results object.
 */
export function runCalculations(inputs) {
  const cashFlows = buildCashFlows(inputs)
  const irr = calcIRR(cashFlows)
  const npv = calcNPV(cashFlows, inputs.discountRate ?? 0.08)
  const payback = calcPayback(cashFlows)
  const lcoe = calcLCOE(inputs)
  return { cashFlows, irr, npv, payback, lcoe }
}
