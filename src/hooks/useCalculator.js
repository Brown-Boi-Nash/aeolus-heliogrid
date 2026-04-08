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

  return { inputs, results }
}
