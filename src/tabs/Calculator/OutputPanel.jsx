import clsx from 'clsx'

function KpiCard({ label, value, unit, sub, icon, status }) {
  // status: 'good' | 'warn' | 'bad' | 'neutral'
  const statusColor = {
    good:    'text-primary',
    warn:    'text-solar-600',
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
        <span className="label-caps">{label}</span>
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
    </div>
  )
}

export default function OutputPanel({ results, inputs }) {
  const { irr, npv, payback, lcoe } = results

  const irrPct   = irr   != null ? (irr * 100).toFixed(1)    : null
  const npvM     = npv   != null ? (npv / 1_000_000).toFixed(2) : null
  const lcoeVal  = lcoe  != null ? lcoe.toFixed(4)            : null
  const payYears = payback != null ? payback.toFixed(1)       : null

  // Thresholds for color-coding
  const irrStatus  = irr == null ? 'neutral' : irr >= 0.12 ? 'good' : irr >= 0.08 ? 'warn' : 'bad'
  const npvStatus  = npv == null ? 'neutral' : npv > 0 ? 'good' : 'bad'
  const lcoeStatus = lcoe == null ? 'neutral' : lcoe < 0.05 ? 'good' : lcoe < 0.09 ? 'warn' : 'bad'
  const pbStatus   = payback == null ? 'neutral' : payback < 8 ? 'good' : payback < 12 ? 'warn' : 'bad'

  const capexM = (inputs.systemSizeKW * 1000 * inputs.installCostPerW / 1_000_000).toFixed(2)

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
        value={irrPct}
        unit="%"
        sub={irr != null
          ? `${irr >= 0.10 ? 'Exceeds' : 'Below'} typical 10% hurdle rate`
          : 'No sign change in cash flows'}
        icon="trending_up"
        status={irrStatus}
      />
      <KpiCard
        label="Net Present Value"
        value={npvM != null ? `$${npvM}M` : null}
        unit=""
        sub={`Discounted @ ${((inputs.discountRate ?? 0.08) * 100).toFixed(1)}% · Capex $${capexM}M`}
        icon="account_balance"
        status={npvStatus}
      />
      <KpiCard
        label="Levelized Cost of Energy"
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
        value={payYears}
        unit="yrs"
        sub={payback != null
          ? `Equity recovered in Year ${Math.ceil(payback)}`
          : 'Not recovered within project life'}
        icon="schedule"
        status={pbStatus}
      />

      {/* ESG Grade — from Stitch design */}
      <div className="bg-surface-container rounded-xl p-4 flex items-center gap-3 mt-auto">
        <div className="w-10 h-10 rounded-xl bg-botanical-gradient flex items-center justify-center flex-shrink-0">
          <span
            className="material-symbols-outlined text-white text-lg"
            aria-hidden="true"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}
          >
            eco
          </span>
        </div>
        <div>
          <p className="label-caps">ESG Impact</p>
          <p className="text-lg font-black text-primary">
            A+ <span className="text-sm font-normal text-on-surface-variant">Exceptional</span>
          </p>
        </div>
      </div>
    </section>
  )
}
