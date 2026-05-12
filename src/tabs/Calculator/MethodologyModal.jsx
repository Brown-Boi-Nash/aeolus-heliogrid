import { useEffect, useRef } from 'react'

function Section({ title, children }) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-extrabold uppercase tracking-widest text-primary border-b border-on-surface/10 pb-1.5">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function Eq({ label, formula, note }) {
  return (
    <div>
      <p className="text-[11px] font-extrabold uppercase tracking-wider text-on-surface mb-0.5">{label}</p>
      <code className="block text-xs bg-surface-container px-3 py-1.5 rounded font-mono text-primary leading-relaxed whitespace-pre-wrap">
        {formula}
      </code>
      {note && <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">{note}</p>}
    </div>
  )
}

function Source({ children }) {
  return (
    <p className="text-[11px] text-on-surface/50 leading-relaxed">{children}</p>
  )
}

export default function MethodologyModal({ onClose }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    el.focus()
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Calculation Methodology"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col bg-surface rounded-2xl shadow-botanical-lg overflow-hidden focus:outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-on-surface/10 bg-surface-container-low flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-botanical-gradient flex items-center justify-center flex-shrink-0">
              <span
                className="material-symbols-outlined text-white text-base"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                functions
              </span>
            </div>
            <div>
              <h2 className="font-extrabold text-on-surface text-sm">How the Numbers are Calculated</h2>
              <p className="label-caps opacity-50">Equations, assumptions &amp; sources</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface/50 hover:text-on-surface hover:bg-surface-container transition-colors"
            aria-label="Close methodology"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto scrollbar-botanical px-6 py-5 space-y-6">

          <Section title="CapEx &amp; Financing">
            <Eq
              label="Total Capital Expenditure"
              formula="CapEx = System Size (kW) × 1,000 × Install Cost ($/W)"
            />
            <Eq
              label="ITC Benefit"
              formula="ITC Benefit = CapEx × ITC %"
              note="Federal Investment Tax Credit applied at Year 0. Currently 30% under the Inflation Reduction Act (IRA 2022)."
            />
            <Eq
              label="Equity Outflow (Year 0)"
              formula="Equity Out = CapEx × (1 − Debt Fraction) − ITC Benefit"
            />
            <Eq
              label="Annual Loan Payment (PMT)"
              formula={"PMT = (Loan × rate × (1 + rate)^n) / ((1 + rate)^n − 1)\n\nwhere  Loan = CapEx × Debt Fraction\n       rate = annual interest rate\n       n    = loan term in years"}
              note="Standard fixed-rate annuity formula — identical to Excel's PMT() function."
            />
          </Section>

          <Section title="Annual Cash Flows (Years 1 – N)">
            <Eq
              label="Annual Energy Production"
              formula={"Energy (kWh) = Size (kW) × 8,760 hr/yr\n             × Capacity Factor\n             × (1 − Degradation Rate)^(year − 1)"}
              note="8,760 hours per year. Degradation compounds annually — solar panels typically lose ~0.5% per year."
            />
            <Eq
              label="Annual Revenue"
              formula={"Revenue = Energy × Electricity Rate\n        × (1 + Escalation Rate)^(year − 1)\n\nPPA mode: Electricity Rate is multiplied by 0.75\n(standard utility-scale Power Purchase Agreement discount)"}
            />
            <Eq
              label="O&M Cost"
              formula={"O&M = Size (kW) × O&M Rate ($/kW/yr)\n    × (1 + Escalation Rate)^(year − 1)"}
            />
            <Eq
              label="Net Annual Cash Flow"
              formula={"CF[n] = Revenue − O&M − Debt Service + MACRS Tax Shield\n\nDebt Service = PMT for years 1–loanTerm, then 0"}
            />
          </Section>

          <Section title="MACRS Accelerated Depreciation">
            <Eq
              label="IRS 5-Year MACRS Schedule"
              formula={"Year:  1      2      3      4      5      6\nRate: 20.0% 32.0% 19.2% 11.52% 11.52%  5.76%"}
              note="6 periods due to the half-year convention. Applies to solar PV and wind energy property per IRS Rev. Proc. 87-56, Asset Class 00.3."
            />
            <Eq
              label="Depreciable Basis"
              formula={"Basis = CapEx × (1 − 0.5 × ITC %)"}
              note="IRS §168(k) requires the depreciable basis to be reduced by 50% of the ITC claimed. Example with 30% ITC: Basis = CapEx × 0.85."
            />
            <Eq
              label="Annual Tax Shield"
              formula={"Shield[n] = Basis × MACRS_Rate[n] × Corporate Tax Rate\n\nDefault corporate tax rate: 21% (TCJA 2017)"}
              note="The tax shield is added as a positive cash flow in years 1–6, reducing the effective cost of the project."
            />
          </Section>

          <Section title="Key Output Metrics">
            <Eq
              label="NPV — Net Present Value"
              formula={"NPV = Σ  CF[i] / (1 + discount rate)^i\n      i=0..N\n\nYear 0 CF is the equity outflow (negative)."}
            />
            <Eq
              label="IRR — Internal Rate of Return"
              formula={"Solved by bisection: find rate r where NPV(r) = 0\nBounds: −50% to 500%, tolerance 0.000001\nReturns null if cash flows never change sign."}
            />
            <Eq
              label="Simple Payback Period"
              formula={"First year where cumulative cash flows ≥ |equity out|\nFractional part: (equity − cumulative at year i−1) / CF[i]"}
            />
            <Eq
              label="LCOE — Levelized Cost of Energy ($/kWh)"
              formula={"LCOE = (CapEx + PV[O&M] − PV[MACRS Shields])\n     / PV[Energy Output]\n\nwhere PV[X at year n] = X / (1 + discount rate)^n"}
              note="After-tax LCOE. MACRS shields reduce net costs in years 1–6. Grid parity benchmark: $0.033–$0.068/kWh (NREL ATB 2024)."
            />
          </Section>

          <Section title="P90 Downside &amp; Scenarios">
            <Eq
              label="P90 Production Estimate"
              formula={"P90 inputs = base inputs with:\n  Capacity Factor × 0.90"}
              note="P90 is the production level exceeded 90% of the time — the conservative resource estimate lenders use for underwriting. NREL convention."
            />
            <Eq
              label="Scenario Multipliers"
              formula={"Optimistic:   CF ×1.1 · Rate ×1.1 · Install ×0.9\nBase:         CF ×1.0 · Rate ×1.0 · Install ×1.0\nConservative: CF ×0.9 · Rate ×0.9 · Install ×1.1"}
              note="Applied to inputs before every calculation run."
            />
          </Section>

          <Section title="Sources">
            <Source>IRS Rev. Proc. 87-56 — MACRS asset class 00.3 (energy property) depreciation schedule</Source>
            <Source>IRS §168(k) — Bonus depreciation basis reduction rule for ITC recipients</Source>
            <Source>Tax Cuts and Jobs Act (TCJA) 2017 — 21% corporate tax rate</Source>
            <Source>Inflation Reduction Act (IRA) 2022 — 30% federal Investment Tax Credit for solar &amp; wind</Source>
            <Source>NREL PVWatts Methodology — energy production formula (8,760 hr/yr × capacity factor)</Source>
            <Source>NREL Annual Technology Baseline (ATB) 2024 — LCOE benchmarks and P90 convention</Source>
            <Source>EIA Open Data API — electricity rates and state-level capacity data</Source>
          </Section>

          <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface/40 pt-2 border-t border-on-surface/10">
            All calculations run client-side and update instantly. Not financial advice — verify independently before investment decisions.
          </p>
        </div>
      </div>
    </div>
  )
}
