import { useMemo } from 'react'
import useDashboardStore from '../store/dashboardStore'
import { SCENARIO_MULTIPLIERS } from '../constants/financialDefaults'
import { applyScenario, runCalculations } from '../lib/financialCalc'

export function useCalculator() {
  const inputs = useDashboardStore((s) => s.calculatorInputs)

  const results = useMemo(() => {
    const multipliers = SCENARIO_MULTIPLIERS[inputs.scenario] ?? SCENARIO_MULTIPLIERS.base
    const adjustedInputs = applyScenario(inputs, multipliers)
    return runCalculations(adjustedInputs)
  }, [inputs])

  // P90: 10th-percentile production year — exceeded 90% of the time.
  // Lenders underwrite to P90; modeled as CF × 0.90 per NREL convention.
  const p90Results = useMemo(() => {
    const multipliers = SCENARIO_MULTIPLIERS[inputs.scenario] ?? SCENARIO_MULTIPLIERS.base
    const adjustedInputs = applyScenario(inputs, multipliers)
    return runCalculations({ ...adjustedInputs, capacityFactor: adjustedInputs.capacityFactor * 0.90 })
  }, [inputs])

  return { inputs, results, p90Results }
}
