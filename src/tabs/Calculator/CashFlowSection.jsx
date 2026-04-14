import clsx from 'clsx'
import MethodologyDrawer, { MethodRow } from '../../components/ui/MethodologyDrawer'

/**
 * Horizontal cash flow bar chart — Botanical Ledger style from Stitch design.
 * Each year is a horizontal bar: negative (capex) in error red, positive in primary green.
 */
export default function CashFlowSection({ cashFlows, projectLifeYears }) {
  if (!cashFlows?.length) return null

  const equity = Math.abs(cashFlows[0])

  // Determine the display years (Year 0, 1–5, 10, 15, 20, 25)
  const yearIndices = [0]
  for (let y = 1; y <= projectLifeYears; y++) {
    if (y <= 5 || y % 5 === 0) yearIndices.push(y)
  }

  // Max absolute value for bar scaling
  const maxAbs = Math.max(equity, ...cashFlows.slice(1).map(Math.abs))

  // Cumulative tracking for payback annotation
  let cumulative = 0
  let paybackYear = null
  for (let i = 1; i < cashFlows.length; i++) {
    cumulative += cashFlows[i]
    if (cumulative >= equity && paybackYear === null) paybackYear = i
  }

  return (
    <section
      className="bg-surface-container-low rounded-xl p-6 flex flex-col gap-6 h-full"
      aria-labelledby="cashflow-heading"
    >
      <div className="flex items-end justify-between">
        <div className="space-y-0.5">
          <h2 id="cashflow-heading" className="font-bold text-on-surface text-base uppercase tracking-wider">
            {projectLifeYears}-Year Cash Flow
          </h2>
          <p className="label-caps opacity-60">Annual free cash flow to equity</p>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-widest">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-primary inline-block" aria-hidden="true" />
            Positive
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-error inline-block" aria-hidden="true" />
            Outflow
          </span>
        </div>
      </div>

      {/* Bars */}
      <div
        className="flex-1 flex flex-col gap-3 overflow-y-auto scrollbar-botanical pr-1"
        role="list"
        aria-label="Annual cash flows"
      >
        {yearIndices.map((yi) => {
          const cf = cashFlows[yi] ?? 0
          const isNegative = cf < 0
          const barPct = Math.min(Math.abs(cf) / maxAbs, 1) * 100
          const cfM = (cf / 1_000_000).toFixed(2)
          const isPaybackYear = yi === paybackYear

          return (
            <div
              key={yi}
              className="flex items-center gap-3 group"
              role="listitem"
              aria-label={`Year ${yi}: $${cfM}M`}
            >
              <span className="w-10 text-xs font-bold text-on-surface-variant tabular-nums flex-shrink-0">
                YR {yi}
              </span>
              <div
                className={clsx(
                  'relative flex-1 h-11 rounded-sm flex items-center overflow-hidden',
                  'bg-surface-container'
                )}
              >
                <div
                  className={clsx(
                    'h-full rounded-sm transition-all duration-300',
                    isNegative ? 'bg-error/80' : 'bg-primary/40 group-hover:bg-primary/60'
                  )}
                  style={{ width: `${barPct}%` }}
                  aria-hidden="true"
                />
                <span
                  className={clsx(
                    'absolute left-3 text-xs font-black tabular-nums',
                    isNegative ? 'text-white' : 'text-primary'
                  )}
                >
                  {isNegative ? '' : '+'}{cf >= 0 ? `$${cfM}M` : `-$${Math.abs(cf / 1_000_000).toFixed(2)}M`}
                </span>
              </div>
              {isPaybackYear && (
                <span
                  className="text-[11px] font-extrabold uppercase tracking-widest text-primary flex-shrink-0"
                  aria-label="Payback year"
                >
                  Payback ✓
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Divider label — from Stitch */}
      {projectLifeYears > 5 && (
        <div className="flex items-center justify-center opacity-30" aria-hidden="true">
          <div className="flex-1 border-t border-dashed border-outline-variant/20" />
          <span className="mx-3 text-[10px] font-bold uppercase tracking-[0.3em]">Operational Phase</span>
          <div className="flex-1 border-t border-dashed border-outline-variant/20" />
        </div>
      )}

      {/* Payback summary */}
      <div className="pt-2 border-t border-on-surface/5">
        <div
          className="flex items-center gap-4 bg-surface-container-lowest p-4 rounded-xl shadow-botanical"
          role="status"
          aria-live="polite"
        >
          <div className="w-11 h-11 bg-secondary-container rounded-full flex items-center justify-center flex-shrink-0">
            <span
              className="material-symbols-outlined text-on-secondary-container"
              aria-hidden="true"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}
            >
              {paybackYear ? 'check_circle' : 'schedule'}
            </span>
          </div>
          <div>
            <p className="label-caps">Payback Period</p>
            <p className="text-xl font-black text-primary tabular-nums" aria-live="polite">
              {paybackYear ? `${paybackYear} Years` : 'Not recovered'}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 pb-4">
        <MethodologyDrawer title="How these are calculated">
          <MethodRow label="IRR — Internal Rate of Return">
            Bisection solver finds the discount rate where NPV equals zero. Bounds: −50% to 500%, converges when |NPV| &lt; 0.000001. Returns null if cash flows never change sign (project always unprofitable).
          </MethodRow>
          <MethodRow label="NPV — Net Present Value">
            Sum of each year's cash flow divided by (1 + discount rate)^year. Year 0 is the equity outlay after debt and ITC. Discount rate is configurable (default 8%).
          </MethodRow>
          <MethodRow label="LCOE — Levelized Cost of Energy">
            Discounted lifetime costs (capex + O&M + debt service) divided by discounted lifetime energy production. Accounts for annual degradation. Lower is better — grid parity is roughly $0.033–$0.068/kWh.
          </MethodRow>
          <MethodRow label="Payback Period">
            First year where cumulative post-equity cash flows recover the Year 0 equity outlay. Fractional year is interpolated linearly.
          </MethodRow>
          <MethodRow label="MACRS Depreciation">
            IRS 5-year schedule (20%, 32%, 19.2%, 11.52%, 11.52%, 5.76%). Depreciable basis is reduced by 50% of the ITC claimed per §168(k). Tax shield is added back as a positive cash flow each year.
          </MethodRow>
          <MethodRow label="P90 Downside IRR">
            Re-runs the full model with capacity factor × 0.90 — the NREL convention for a 90th-percentile conservative resource estimate.
          </MethodRow>
          <MethodRow label="Scenario Multipliers">
            Optimistic: capacity factor ×1.1, electricity rate ×1.1, install cost ×0.9. Conservative: ×0.9, ×0.9, ×1.1. Applied before every calculation.
          </MethodRow>
          <MethodRow label="PPA Mode">
            Replaces the retail electricity rate with 75% of retail — the standard utility-scale power purchase agreement rate.
          </MethodRow>
        </MethodologyDrawer>
      </div>
    </section>
  )
}
