import { useMemo } from 'react'
import { SCENARIO_MULTIPLIERS } from '../../constants/financialDefaults'
import { applyScenario, runCalculations } from '../../lib/financialCalc'

const HURDLE = 0.10
const RATE_STEPS = [-0.2, -0.1, 0, 0.1, 0.2]
const COST_STEPS = [-0.2, -0.1, 0, 0.1, 0.2]

function formatPct(value) {
  return `${(value * 100).toFixed(0)}%`
}

function getCellTone(irr, meetsHurdle) {
  const base = (() => {
    if (irr == null) return 'bg-error-container/60 text-on-error-container'
    if (irr >= 0.16) return 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
    if (irr >= 0.12) return 'bg-secondary-fixed text-on-secondary-fixed-variant'
    if (irr >= 0.08) return 'bg-surface-container text-on-surface'
    return 'bg-error-container text-on-error-container'
  })()
  return base
}

/**
 * Binary search: find the max installCostPerW that still hits `targetIrr`
 * for a given set of inputs (all other params fixed).
 * Returns null if even minimum cost can't hit target, or if even max cost does.
 */
function breakevenCapex(baseInputs, targetIrr = HURDLE, minCost = 0.3, maxCost = 6.0) {
  const testIrr = (cost) => {
    const r = runCalculations({ ...baseInputs, installCostPerW: cost })
    return r.irr ?? -Infinity
  }
  if (testIrr(minCost) < targetIrr) return null   // even cheapest doesn't work
  if (testIrr(maxCost) >= targetIrr) return maxCost // even most expensive works

  let lo = minCost, hi = maxCost
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2
    if (testIrr(mid) >= targetIrr) lo = mid
    else hi = mid
    if (hi - lo < 0.001) break
  }
  return (lo + hi) / 2
}

export default function SensitivityHeatmap({ inputs }) {
  const { matrix, baseInputs } = useMemo(() => {
    const multipliers = SCENARIO_MULTIPLIERS[inputs.scenario] ?? SCENARIO_MULTIPLIERS.base
    const base = applyScenario(inputs, multipliers)

    const m = RATE_STEPS.map((rateShift) =>
      COST_STEPS.map((costShift) => {
        const adjusted = {
          ...base,
          electricityRate: base.electricityRate * (1 + rateShift),
          installCostPerW: base.installCostPerW * (1 + costShift),
        }
        return runCalculations(adjusted).irr
      })
    )
    return { matrix: m, baseInputs: base }
  }, [inputs])

  // Breakeven capex at current electricity rate (no rate shift)
  const breakeven = useMemo(() => breakevenCapex(baseInputs), [baseInputs])

  // Current capex for display
  const currentCapex = baseInputs.installCostPerW

  return (
    <section className="bg-surface-container-low rounded-xl p-6" aria-labelledby="sensitivity-heading">
      <div className="mb-4 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 id="sensitivity-heading" className="font-bold text-on-surface text-base uppercase tracking-wider">
            IRR Sensitivity Heatmap
          </h2>
          <p className="label-caps mt-1">
            Electricity Rate (rows) vs Install Cost (columns) · +/-20% around current scenario
          </p>
        </div>

        {/* Breakeven callout */}
        <div className="flex items-center gap-3 bg-surface-container rounded-xl px-4 py-2.5 flex-shrink-0">
          <span
            className="material-symbols-outlined text-primary text-base"
            aria-hidden="true"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}
          >
            gpp_good
          </span>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface/40">
              10% Hurdle Breakeven
            </p>
            {breakeven != null ? (
              <p className="text-sm font-extrabold text-on-surface tabular-nums">
                ≤ ${breakeven.toFixed(2)}/W
                <span className="text-[10px] font-medium text-on-surface-variant ml-1.5">
                  capex at current rate
                  {breakeven >= currentCapex
                    ? <span className="text-primary ml-1">(you're inside)</span>
                    : <span className="text-error ml-1">(above limit)</span>
                  }
                </span>
              </p>
            ) : (
              <p className="text-sm font-extrabold text-error">Not achievable at current rate</p>
            )}
          </div>
        </div>
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
                  const meetsHurdle = irr != null && irr >= HURDLE
                  const isBase = rateShift === 0 && costShift === 0
                  return (
                    <td key={`${rateShift}-${costShift}`} className="px-2 py-2">
                      <div
                        className={[
                          'rounded-md py-2 text-center text-xs font-extrabold tabular-nums relative',
                          getCellTone(irr, meetsHurdle),
                          isBase ? 'ring-2 ring-primary ring-inset' : '',
                        ].join(' ')}
                      >
                        {irr == null ? 'N/A' : `${(irr * 100).toFixed(1)}%`}
                        {/* Hurdle badge */}
                        {meetsHurdle && (
                          <span
                            className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-primary/60"
                            aria-label="Meets 10% hurdle"
                            title="≥10% hurdle rate"
                          />
                        )}
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
        <span className="px-2 py-1 rounded bg-tertiary-fixed text-on-tertiary-fixed-variant">Strong ≥16%</span>
        <span className="px-2 py-1 rounded bg-secondary-fixed text-on-secondary-fixed-variant">Healthy ≥12%</span>
        <span className="px-2 py-1 rounded bg-surface-container text-on-surface">Borderline ≥8%</span>
        <span className="px-2 py-1 rounded bg-error-container text-on-error-container">Weak &lt;8%</span>
        <span className="flex items-center gap-1 px-2 py-1 rounded bg-surface-container text-on-surface">
          <span className="w-1.5 h-1.5 rounded-full bg-primary/60 inline-block" />
          ≥10% hurdle
        </span>
        <span className="flex items-center gap-1 px-2 py-1 rounded ring-1 ring-primary text-on-surface">
          ring = current
        </span>
      </div>
    </section>
  )
}
