/**
 * Grid Parity Status
 *
 * Compares retail electricity prices (national + regional) against NREL ATB 2024
 * utility-scale LCOE bounds. The core question for an analyst: how far above or
 * below cost-parity is each market?
 *
 * Solar LCOE range: $0.033–$0.068/kWh  (NREL ATB 2024)
 * Wind  LCOE range: $0.033–$0.054/kWh  (NREL ATB 2024)
 */

const ATB = {
  solar: { lo: 0.033, hi: 0.068, label: 'Utility-Scale Solar', icon: 'solar_power' },
  wind:  { lo: 0.033, hi: 0.054, label: 'Onshore Wind',         icon: 'wind_power' },
}

const REGION_ORDER = ['Southwest', 'Southeast', 'Pacific', 'Midwest', 'Northeast']

/**
 * Returns status and spread vs the low-end LCOE bound (most favorable site).
 * Spread > 0 means parity is achieved; spread < 0 means below parity.
 */
function parityInfo(retailRate, lo, hi) {
  if (retailRate == null) return { status: null, spreadVsLo: null, spreadVsHi: null }
  const spreadVsLo = retailRate - lo   // positive = at/above parity
  const spreadVsHi = retailRate - hi   // positive = above even worst-case LCOE
  let status
  if (retailRate >= lo)                status = 'parity'
  else if ((lo - retailRate) / lo <= 0.25) status = 'near'
  else                                 status = 'below'
  return { status, spreadVsLo, spreadVsHi }
}

const STATUS_META = {
  parity: { label: 'At Parity',   dot: 'bg-primary',   text: 'text-primary',   pill: 'bg-primary/10 text-primary' },
  near:   { label: 'Near Parity', dot: 'bg-secondary',  text: 'text-secondary', pill: 'bg-secondary/10 text-secondary' },
  below:  { label: 'Below',       dot: 'bg-on-surface/30', text: 'text-on-surface-variant', pill: 'bg-on-surface/8 text-on-surface-variant' },
}

function SpreadBar({ spreadVsLo, spreadVsHi }) {
  // Shows how far the retail rate sits above the LCOE range.
  // Bar represents the spread above low-end LCOE as a % of retail rate.
  if (spreadVsLo == null) return null
  const maxSpread = 0.20  // cap display at $0.20 spread for scale
  const clamp = (v) => Math.max(0, Math.min(1, v / maxSpread))

  const loFill  = clamp(spreadVsLo)   // spread above low-end
  const hiFill  = clamp(spreadVsHi)   // spread above high-end (smaller)

  return (
    <div className="relative h-1.5 rounded-full bg-on-surface/8 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-y-0 left-0 rounded-full bg-primary/25" style={{ width: `${loFill * 100}%` }} />
      {spreadVsHi > 0 && (
        <div className="absolute inset-y-0 left-0 rounded-full bg-primary/60" style={{ width: `${hiFill * 100}%` }} />
      )}
    </div>
  )
}

function RegionRow({ name, price, lo, hi, isLast }) {
  const { status, spreadVsLo, spreadVsHi } = parityInfo(price, lo, hi)
  const meta = status ? STATUS_META[status] : null

  return (
    <div className={`flex items-center gap-4 py-3 ${!isLast ? 'border-b border-on-surface/6' : ''}`}>
      {/* Status dot */}
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${meta?.dot ?? 'bg-on-surface/20'}`} aria-hidden="true" />

      {/* Region name */}
      <span className="text-sm font-bold text-on-surface w-24 flex-shrink-0">{name}</span>

      {/* Price */}
      <span className="text-xs tabular-nums font-mono text-on-surface-variant w-16 flex-shrink-0">
        {price != null ? `$${price.toFixed(3)}` : '—'}
      </span>

      {/* Spread bar + label */}
      <div className="flex-1 min-w-0">
        {spreadVsLo != null && <SpreadBar spreadVsLo={spreadVsLo} spreadVsHi={spreadVsHi} />}
      </div>

      {/* Spread vs lo label */}
      <span className={`text-xs font-extrabold tabular-nums w-20 text-right flex-shrink-0 ${meta?.text ?? 'text-on-surface/30'}`}>
        {spreadVsLo != null
          ? `${spreadVsLo >= 0 ? '+' : ''}$${spreadVsLo.toFixed(3)}`
          : '—'}
      </span>

      {/* Status pill */}
      {meta && (
        <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0 ${meta.pill}`}>
          {meta.label}
        </span>
      )}
    </div>
  )
}

export default function GridParityStatus({ energyType, nationalPrice, regionalRows }) {
  const atb = ATB[energyType] ?? ATB.solar
  const { status: natStatus, spreadVsLo: natSpread } = parityInfo(nationalPrice, atb.lo, atb.hi)
  const natMeta = natStatus ? STATUS_META[natStatus] : null

  const regions = REGION_ORDER
    .map((name) => {
      const row = (regionalRows ?? []).find((r) => r.region === name)
      return row ? { name, price: row.avgPrice } : null
    })
    .filter(Boolean)

  return (
    <section
      className="bg-surface-container-highest rounded-xl overflow-hidden border-l-4 border-primary"
      aria-labelledby="grid-parity-heading"
    >
      {/* ── Header ── */}
      <div className="px-6 pt-5 pb-4 flex flex-col sm:flex-row sm:items-start gap-5 border-b border-on-surface/8">
        <div className="flex-1 min-w-0">
          <span className="label-caps text-primary block mb-1">Grid Parity Analysis</span>
          <h2 id="grid-parity-heading" className="text-xl font-extrabold text-on-surface">
            {atb.label} vs. Retail Electricity
          </h2>
          <p className="text-xs text-on-surface-variant mt-1 max-w-lg leading-relaxed">
            At parity, new {energyType === 'wind' ? 'wind' : 'solar'} is cost-competitive with grid power before subsidies.
            Spread = retail price minus NREL ATB low-end LCOE (${atb.lo.toFixed(3)}/kWh).
          </p>
        </div>

        {/* National summary block */}
        <div className="flex-shrink-0 flex items-center gap-4 bg-surface-container rounded-xl px-5 py-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">US National Avg</p>
            <p className="text-2xl font-black tabular-nums text-on-surface mt-0.5">
              {nationalPrice != null ? `$${nationalPrice.toFixed(3)}` : '—'}
              <span className="text-sm font-medium text-on-surface-variant ml-1">/kWh</span>
            </p>
          </div>
          <div className="w-px h-10 bg-on-surface/10" aria-hidden="true" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Spread vs LCOE lo</p>
            <p className={`text-2xl font-black tabular-nums mt-0.5 ${natMeta?.text ?? 'text-on-surface/30'}`}>
              {natSpread != null ? `${natSpread >= 0 ? '+' : ''}$${natSpread.toFixed(3)}` : '—'}
            </p>
          </div>
          {natMeta && (
            <>
              <div className="w-px h-10 bg-on-surface/10" aria-hidden="true" />
              <span className={`text-sm font-extrabold uppercase tracking-wide ${natMeta.text}`}>
                {natMeta.label}
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── LCOE reference strip ── */}
      <div className="px-6 py-2.5 bg-surface-container/40 border-b border-on-surface/6 flex items-center gap-6 flex-wrap">
        <span className="label-caps opacity-40 mr-1">NREL ATB 2024</span>
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm text-on-surface-variant"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 300" }}>{atb.icon}</span>
          <span className="text-[10px] font-bold text-on-surface-variant">
            {atb.label} LCOE range:
            <span className="text-on-surface font-extrabold ml-1">${atb.lo.toFixed(3)}–${atb.hi.toFixed(3)}/kWh</span>
          </span>
        </div>
        <span className="text-[9px] text-on-surface/30">Low-end = best resource site · High-end = marginal site</span>
      </div>

      {/* ── Column headers ── */}
      {regions.length > 0 && (
        <div className="px-6 pt-4">
          <div className="flex items-center gap-4 pb-1">
            <div className="w-2 flex-shrink-0" />
            <span className="label-caps opacity-40 w-24 flex-shrink-0">Region</span>
            <span className="label-caps opacity-40 w-16 flex-shrink-0">Avg Price</span>
            <div className="flex-1" />
            <span className="label-caps opacity-40 w-20 text-right flex-shrink-0">vs Lo-LCOE</span>
            <span className="label-caps opacity-40 w-20 text-right flex-shrink-0">Status</span>
          </div>

          {/* ── Regional rows ── */}
          {regions.map((r, i) => (
            <RegionRow
              key={r.name}
              name={r.name}
              price={r.price}
              lo={atb.lo}
              hi={atb.hi}
              isLast={i === regions.length - 1}
            />
          ))}
        </div>
      )}

      <p className="px-6 py-3 text-[9px] text-on-surface/25 border-t border-on-surface/6 mt-1">
        NREL ATB 2024 · EIA retail electricity prices (latest month) · Spread = retail − LCOE low-end ·
        Parity does not account for transmission, curtailment, or interconnection costs
      </p>
    </section>
  )
}
