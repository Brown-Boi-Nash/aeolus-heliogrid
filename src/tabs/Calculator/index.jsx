import useDashboardStore from '../../store/dashboardStore'
import { useCalculator } from '../../hooks/useCalculator'
import InputPanel from './InputPanel'
import OutputPanel from './OutputPanel'
import CashFlowSection from './CashFlowSection'

export default function Calculator({ onNavigate }) {
  const { inputs, results } = useCalculator()
  const selectedStateAbbr = useDashboardStore((s) => s.selectedStateAbbr)

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Header ────────────────────────────────────────────────── */}
      <section
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        aria-labelledby="calculator-heading"
      >
        <div>
          <h1
            id="calculator-heading"
            className="text-4xl font-extrabold text-on-surface tracking-tight"
          >
            Project Economics
          </h1>
          <p className="text-on-surface-variant font-medium mt-1">
            Solar investment return modeling · Instant recalculation
          </p>
        </div>

        {selectedStateAbbr && (
          <div
            className="flex items-center gap-2 bg-tertiary-fixed text-on-tertiary-fixed-variant px-4 py-2 rounded-xl text-xs font-bold"
            role="status"
            aria-live="polite"
          >
            <span
              className="material-symbols-outlined text-sm"
              aria-hidden="true"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              location_on
            </span>
            {selectedStateAbbr} data applied from Map
            <button
              onClick={() => onNavigate?.(3)}
              className="underline underline-offset-2 hover:opacity-70 transition-opacity focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-current rounded"
              aria-label="Go to Geographic Map tab"
            >
              Change →
            </button>
          </div>
        )}
      </section>

      {/* ── 3-Column Layout (from Stitch: inputs | outputs | cashflow) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left: Input Panel (3 cols) */}
        <div className="lg:col-span-3">
          <InputPanel selectedStateAbbr={selectedStateAbbr} />
        </div>

        {/* Center: KPI Output Cards (4 cols) */}
        <div className="lg:col-span-4">
          <OutputPanel results={results} inputs={inputs} />
        </div>

        {/* Right: Cash Flow Bars (5 cols) */}
        <div className="lg:col-span-5 min-h-[600px]">
          <CashFlowSection
            cashFlows={results.cashFlows}
            projectLifeYears={inputs.projectLifeYears}
          />
        </div>

      </div>

      {/* ── Methodology Note ──────────────────────────────────────── */}
      <section
        className="bg-surface-container-highest rounded-xl p-5 border-l-4 border-primary"
        aria-label="Calculation methodology"
      >
        <p className="label-caps text-primary mb-1">Methodology</p>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          IRR solved via bisection (Newton-Raphson). NPV discounted at user-specified rate.
          LCOE = (discounted lifetime costs) / (discounted lifetime energy production).
          Cash flows modeled as equity perspective — Year 0 is net equity outflow after ITC.
          Capacity factor and electricity rate auto-fill from Geographic Map (cross-tab flow) or EIA national average.
        </p>
      </section>

    </div>
  )
}
