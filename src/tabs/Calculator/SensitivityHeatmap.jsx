import { useMemo } from 'react'
import { SCENARIO_MULTIPLIERS } from '../../constants/financialDefaults'
import { applyScenario, runCalculations } from '../../lib/financialCalc'

const RATE_STEPS = [-0.2, -0.1, 0, 0.1, 0.2]
const COST_STEPS = [-0.2, -0.1, 0, 0.1, 0.2]

function formatPct(value) {
  return `${(value * 100).toFixed(0)}%`
}

function getCellTone(irr) {
  if (irr == null) return 'bg-error-container/60 text-on-error-container'
  if (irr >= 0.16) return 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
  if (irr >= 0.12) return 'bg-secondary-fixed text-on-secondary-fixed-variant'
  if (irr >= 0.08) return 'bg-surface-container text-on-surface'
  return 'bg-error-container text-on-error-container'
}

export default function SensitivityHeatmap({ inputs }) {
  const matrix = useMemo(() => {
    const multipliers = SCENARIO_MULTIPLIERS[inputs.scenario] ?? SCENARIO_MULTIPLIERS.base
    const base = applyScenario(inputs, multipliers)

    return RATE_STEPS.map((rateShift) => {
      return COST_STEPS.map((costShift) => {
        const adjusted = {
          ...base,
          electricityRate: base.electricityRate * (1 + rateShift),
          installCostPerW: base.installCostPerW * (1 + costShift),
        }
        const result = runCalculations(adjusted)
        return result.irr
      })
    })
  }, [inputs])

  return (
    <section className="bg-surface-container-low rounded-xl p-6" aria-labelledby="sensitivity-heading">
      <div className="mb-4">
        <h2 id="sensitivity-heading" className="font-bold text-on-surface text-base uppercase tracking-wider">
          IRR Sensitivity Heatmap
        </h2>
        <p className="label-caps mt-1">
          Electricity Rate (rows) vs Install Cost (columns), +/-20% around current scenario
        </p>
      </div>

      <div className="overflow-x-auto scrollbar-botanical">
        <table className="w-full min-w-[560px]" aria-label="IRR sensitivity heatmap table">
          <thead>
            <tr>
              <th className="text-left px-2 py-2 label-caps">Rate \ Cost</th>
              {COST_STEPS.map((costShift) => (
                <th key={costShift} className="text-center px-2 py-2 label-caps">
                  {costShift > 0 ? '+' : ''}{formatPct(costShift)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RATE_STEPS.map((rateShift, rowIdx) => (
              <tr key={rateShift}>
                <th className="text-left px-2 py-2 label-caps whitespace-nowrap">
                  {rateShift > 0 ? '+' : ''}{formatPct(rateShift)}
                </th>
                {COST_STEPS.map((costShift, colIdx) => {
                  const irr = matrix[rowIdx][colIdx]
                  return (
                    <td key={`${rateShift}-${costShift}`} className="px-2 py-2">
                      <div className={`rounded-md py-2 text-center text-xs font-extrabold tabular-nums ${getCellTone(irr)}`}>
                        {irr == null ? 'N/A' : `${(irr * 100).toFixed(1)}%`}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-widest">
        <span className="px-2 py-1 rounded bg-tertiary-fixed text-on-tertiary-fixed-variant">Strong &gt;=16%</span>
        <span className="px-2 py-1 rounded bg-secondary-fixed text-on-secondary-fixed-variant">Healthy &gt;=12%</span>
        <span className="px-2 py-1 rounded bg-surface-container text-on-surface">Borderline &gt;=8%</span>
        <span className="px-2 py-1 rounded bg-error-container text-on-error-container">Weak &lt;8%</span>
      </div>
    </section>
  )
}
