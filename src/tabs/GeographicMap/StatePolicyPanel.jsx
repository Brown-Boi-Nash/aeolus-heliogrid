import { getPolicyForState, netMeteringLabel } from '../../constants/statePolicies'

function PolicyChip({ value, positive }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${
      positive
        ? 'bg-primary/10 text-primary'
        : 'bg-on-surface/8 text-on-surface-variant'
    }`}>
      {value}
    </span>
  )
}

function PolicyCard({ icon, label, children }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span
          className="material-symbols-outlined text-base text-primary"
          aria-hidden="true"
          style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}
        >
          {icon}
        </span>
        <span className="label-caps">{label}</span>
      </div>
      {children}
    </div>
  )
}

export default function StatePolicyPanel({ abbr, name }) {
  const policy = getPolicyForState(abbr)
  if (!policy) return null

  const nmPositive = policy.netMetering === 'full' || policy.netMetering === 'virtual'

  return (
    <section className="space-y-3" aria-labelledby="policy-heading">
      <div className="flex items-baseline justify-between">
        <div>
          <h2 id="policy-heading" className="font-bold text-on-surface text-base uppercase tracking-wider">
            {name} · Policy Context
          </h2>
          <p className="label-caps opacity-60 mt-0.5">Renewable energy regulations &amp; incentives</p>
        </div>
        <span className="label-caps opacity-40">Source: DSIRE · EIA · NCSL</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

        {/* RPS */}
        <PolicyCard icon="flag" label="Renewable Portfolio Standard">
          {policy.rps ? (
            <PolicyChip value={policy.rps} positive />
          ) : (
            <PolicyChip value="No RPS" positive={false} />
          )}
        </PolicyCard>

        {/* Net Metering */}
        <PolicyCard icon="electric_meter" label="Net Metering">
          <PolicyChip value={netMeteringLabel(policy.netMetering)} positive={nmPositive} />
        </PolicyCard>

        {/* Tax Exemptions */}
        <PolicyCard icon="receipt_long" label="Tax Exemptions">
          <div className="flex flex-wrap gap-1.5">
            <PolicyChip value={policy.propertyTax ? 'Property Tax ✓' : 'Property Tax ✗'} positive={policy.propertyTax} />
            <PolicyChip value={policy.salesTax ? 'Sales Tax ✓' : 'Sales Tax ✗'} positive={policy.salesTax} />
          </div>
        </PolicyCard>

        {/* State Incentive */}
        <PolicyCard icon="savings" label="State Incentive">
          {policy.stateCredit ? (
            <PolicyChip value={policy.stateCredit} positive />
          ) : (
            <PolicyChip value="Federal ITC only" positive={false} />
          )}
        </PolicyCard>

      </div>

      {/* Analyst Note */}
      <div className="bg-surface-container-low rounded-xl px-4 py-3 flex items-start gap-3">
        <span
          className="material-symbols-outlined text-base text-on-surface-variant mt-0.5 flex-shrink-0"
          style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
        >
          info
        </span>
        <p className="text-xs text-on-surface-variant leading-relaxed font-medium">{policy.notes}</p>
      </div>
    </section>
  )
}
