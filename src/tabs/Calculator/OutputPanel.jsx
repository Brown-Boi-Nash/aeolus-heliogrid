import { useMemo } from 'react'
import clsx from 'clsx'
import InfoHint from '../../components/ui/InfoHint'
import useDashboardStore from '../../store/dashboardStore'
import { computeEsg, EMISSION_FACTORS, US_AVG_EMISSION } from '../../lib/esgCalc'

function KpiCard({ label, info, value, unit, sub, sub2, icon, status }) {
  // status: 'good' | 'warn' | 'bad' | 'neutral'
  const statusColor = {
    good:    'text-primary',
    warn:    'text-secondary',
    bad:     'text-error',
    neutral: 'text-on-surface',
  }[status ?? 'neutral']

  return (
    <div
      className="bg-surface-container-lowest rounded-xl p-6 flex flex-col justify-between shadow-botanical"
      role="region"
      aria-label={label}
    >
      <div className="flex items-start justify-between">
        <span className="label-caps flex items-center gap-1.5">
          {label}
          <InfoHint text={info} label={`${label} info`} />
        </span>
        {icon && (
          <span
            className="material-symbols-outlined text-on-surface-variant text-lg"
            aria-hidden="true"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
          >
            {icon}
          </span>
        )}
      </div>
      <p
        className={clsx('text-4xl font-black tracking-tight mt-3 tabular-nums', statusColor)}
        aria-live="polite"
      >
        {value ?? '—'}
        {unit && value != null && (
          <span className="text-lg font-medium text-on-surface-variant ml-1">{unit}</span>
        )}
      </p>
      {sub && (
        <p className="text-xs text-on-surface-variant mt-2 font-medium">{sub}</p>
      )}
      {sub2 && (
        <p className="text-[10px] text-on-surface/40 font-semibold mt-1 tabular-nums">{sub2}</p>
      )}
    </div>
  )
}

export default function OutputPanel({ results, inputs, p90Results }) {
  const selectedState = useDashboardStore((s) => s.selectedState)
  const { irr, npv, payback, lcoe } = results

  const p90Irr    = p90Results?.irr
  const irrPct   = irr   != null ? (irr * 100).toFixed(1)    : null
  const p90IrrPct = p90Irr != null ? (p90Irr * 100).toFixed(1) : null
  const npvM     = npv   != null ? (npv / 1_000_000).toFixed(2) : null
  const lcoeVal  = lcoe  != null ? lcoe.toFixed(4)            : null
  const payYears = payback != null ? payback.toFixed(1)       : null

  // Thresholds for color-coding
  const irrStatus  = irr == null ? 'neutral' : irr >= 0.12 ? 'good' : irr >= 0.08 ? 'warn' : 'bad'
  const npvStatus  = npv == null ? 'neutral' : npv > 0 ? 'good' : 'bad'
  const lcoeStatus = lcoe == null ? 'neutral' : lcoe < 0.05 ? 'good' : lcoe < 0.09 ? 'warn' : 'bad'
  const pbStatus   = payback == null ? 'neutral' : payback < 8 ? 'good' : payback < 12 ? 'warn' : 'bad'

  const capexM = (inputs.systemSizeKW * 1000 * inputs.installCostPerW / 1_000_000).toFixed(2)

  const esg = useMemo(
    () => computeEsg(inputs, selectedState?.abbr),
    [inputs, selectedState?.abbr],
  )

  return (
    <section
      className="flex flex-col gap-4"
      aria-label="Calculated financial outputs"
    >
      {irr === null && (
        <div
          role="alert"
          className="bg-error-container text-on-error-container rounded-xl px-4 py-3 text-sm font-medium"
        >
          IRR not achievable under current inputs — project may not be profitable. Try increasing electricity rate or reducing install cost.
        </div>
      )}

      <KpiCard
        label="Internal Rate of Return"
        info="Discount rate that makes project NPV equal zero. Higher IRR generally indicates stronger returns."
        value={irrPct}
        unit="%"
        sub={irr != null
          ? `${irr >= 0.10 ? 'Exceeds' : 'Below'} typical 10% hurdle rate`
          : 'No sign change in cash flows'}
        sub2={p90IrrPct != null ? `P90 downside: ${p90IrrPct}%` : undefined}
        icon="trending_up"
        status={irrStatus}
      />
      <KpiCard
        label="Net Present Value"
        info="Present value of future cash flows minus upfront equity outflow, discounted by your selected discount rate."
        value={npvM != null ? `$${npvM}M` : null}
        unit=""
        sub={`Discounted @ ${((inputs.discountRate ?? 0.08) * 100).toFixed(1)}% · Capex $${capexM}M`}
        icon="account_balance"
        status={npvStatus}
      />
      <KpiCard
        label="Levelized Cost of Energy"
        info="Discounted lifetime cost divided by discounted lifetime energy output, expressed as dollars per kWh."
        value={lcoeVal != null ? `$${lcoeVal}` : null}
        unit="/ kWh"
        sub={lcoe != null
          ? lcoe < 0.05 ? 'Grid parity achieved' : 'Above utility-scale average ($0.033–0.068)'
          : null}
        icon="bolt"
        status={lcoeStatus}
      />
      <KpiCard
        label="Simple Payback Period"
        info="Years required for cumulative project cash inflows to recover initial equity investment."
        value={payYears}
        unit="yrs"
        sub={payback != null
          ? `Equity recovered in Year ${Math.ceil(payback)}`
          : 'Not recovered within project life'}
        icon="schedule"
        status={pbStatus}
      />

      {/* ESG Impact — derived from project inputs + EPA eGRID emission factors */}
      <div
        className="bg-surface-container rounded-xl p-4 mt-auto"
        role="region"
        aria-label="ESG Impact"
      >
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-botanical-gradient flex items-center justify-center flex-shrink-0">
              <span
                className="material-symbols-outlined text-white text-base"
                aria-hidden="true"
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}
              >
                eco
              </span>
            </div>
            <span className="label-caps">
              ESG Impact
              <InfoHint
                text={`Grade factors: capacity factor quality (40 pts), grid decarbonization impact via EPA eGRID emission factor for ${selectedState?.name ?? 'selected state'} (30 pts), project scale (20 pts), ITC captured (10 pts). Score: ${esg.score}/100.`}
                label="ESG methodology"
              />
            </span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-primary">{esg.grade}</span>
            <span className="text-xs text-on-surface-variant ml-1.5 font-medium">{esg.label}</span>
          </div>
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-surface-container-low rounded-lg px-2 py-2">
            <p className="text-base font-black text-primary tabular-nums">
              {esg.co2Tonnes >= 1_000
                ? `${(esg.co2Tonnes / 1_000).toFixed(1)}k`
                : Math.round(esg.co2Tonnes)}
            </p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mt-0.5 leading-tight">
              tonnes CO₂/yr
            </p>
          </div>
          <div className="bg-surface-container-low rounded-lg px-2 py-2">
            <p className="text-base font-black text-primary tabular-nums">
              {esg.carsEquivalent >= 1_000
                ? `${(esg.carsEquivalent / 1_000).toFixed(1)}k`
                : esg.carsEquivalent}
            </p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mt-0.5 leading-tight">
              cars removed
            </p>
          </div>
          <div className="bg-surface-container-low rounded-lg px-2 py-2">
            <p className="text-base font-black text-primary tabular-nums">
              {esg.homesPowered >= 1_000
                ? `${(esg.homesPowered / 1_000).toFixed(1)}k`
                : esg.homesPowered}
            </p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mt-0.5 leading-tight">
              homes powered
            </p>
          </div>
        </div>

        {/* Footnote */}
        <p className="text-[11px] text-on-surface/40 mt-2 leading-tight">
          EPA eGRID 2022 · {selectedState?.name ?? 'US avg'}{' '}
          {(EMISSION_FACTORS[selectedState?.abbr] ?? US_AVG_EMISSION).toFixed(3)} kg CO₂e/kWh ·{' '}
          EIA: 10,500 kWh/home/yr · EPA: 4.6 t CO₂/car/yr
        </p>
      </div>
    </section>
  )
}
