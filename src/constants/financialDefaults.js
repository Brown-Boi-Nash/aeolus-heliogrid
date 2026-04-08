export const FINANCIAL_DEFAULTS = {
  systemSizeKW: 1000,
  capacityFactor: 0.18,
  degradationRate: 0.005,
  installCostPerW: 2.00,
  omCostPerKWPerYear: 15,
  electricityRate: 0.122,
  escalationRate: 0.02,
  debtFraction: 0.20,
  interestRate: 0.055,
  loanTermYears: 20,
  projectLifeYears: 25,
  itcPercent: 0.30,
  discountRate: 0.08,
  scenario: 'base',
}

export const SCENARIO_MULTIPLIERS = {
  base: {
    capacityFactor: 1.0,
    electricityRate: 1.0,
    installCostPerW: 1.0,
  },
  optimistic: {
    capacityFactor: 1.10,
    electricityRate: 1.10,
    installCostPerW: 0.90,
  },
  conservative: {
    capacityFactor: 0.90,
    electricityRate: 0.90,
    installCostPerW: 1.10,
  },
}
