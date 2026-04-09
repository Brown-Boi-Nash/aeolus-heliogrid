import { useMemo } from 'react'
import MapContainer from './MapContainer'
import StatePolicyPanel from './StatePolicyPanel'
import { useEiaData } from '../../hooks/useEiaData'
import useDashboardStore from '../../store/dashboardStore'
import { STATE_METADATA } from '../../constants/stateMetadata'

function marketLabel(price) {
  if (price == null) return 'Emerging'
  if (price >= 0.18) return 'Premium Grid'
  if (price >= 0.14) return 'Stable'
  if (price >= 0.11) return 'Developing'
  return 'Low-Price Grid'
}

function opportunityTag(resource, energyType) {
  if (energyType === 'wind') {
    if (resource >= 7.2) return 'Wind Focus'
    if (resource >= 6.4) return 'High Potential'
    return 'Emerging'
  }
  if (resource >= 5.8) return 'High Potential'
  if (resource >= 5.0) return 'Strong Solar'
  return 'Developing'
}

function topStates(metadata, statePrices, energyType) {
  return metadata
    .map((s) => {
      const price = statePrices[s.abbr] ?? null
      const resource = energyType === 'wind' ? s.windSpeed : s.ghi
      const score = resource * (price ?? 0.12)
      return { ...s, price, resource, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
}

export default function GeographicMap({ onNavigate }) {
  useEiaData()
  const energyType    = useDashboardStore((s) => s.energyType)
  const statePrices   = useDashboardStore((s) => s.statePrices)
  const selectedState = useDashboardStore((s) => s.selectedState)

  // Default policy display to Alabama if no state clicked yet
  const DEFAULT_STATE = useMemo(
    () => STATE_METADATA.find((s) => s.abbr === 'AL'),
    []
  )
  const policyAbbr = selectedState?.abbr ?? DEFAULT_STATE.abbr
  const policyName = selectedState?.name ?? DEFAULT_STATE.name
  const topInvestStates = useMemo(
    () => topStates(STATE_METADATA, statePrices, energyType),
    [statePrices, energyType]
  )

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Header ────────────────────────────────────────────────── */}
      <section
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        aria-labelledby="map-heading"
      >
        <div>
          <h1
            id="map-heading"
            className="text-4xl font-extrabold text-on-surface tracking-tight"
          >
            Geographic Map
          </h1>
          <p className="text-on-surface-variant font-medium mt-1">
            U.S. {energyType === 'wind' ? 'wind speed' : 'solar irradiance'} by state · Click a state to analyze
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-on-surface/40">
          <span className="material-symbols-outlined text-sm" aria-hidden="true"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>info</span>
          <span>
            {energyType === 'wind'
              ? 'Wind speed: pre-bundled toolkit · Rates: EIA · Capacity Factor: pre-bundled wind CF'
              : 'GHI: NREL NSRDB · Rates: EIA · Capacity Factor: NREL PVWatts v8'}
          </span>
        </div>
      </section>

      {/* ── Map ───────────────────────────────────────────────────── */}
      <div
        className="rounded-xl overflow-hidden shadow-botanical"
        style={{ height: 'clamp(480px, 68vh, 680px)' }}
      >
        <MapContainer onNavigate={onNavigate} energyType={energyType} />
      </div>

      {/* ── State Policy Panel ───────────────────────────────────── */}
      <StatePolicyPanel abbr={policyAbbr} name={policyName} />

      {/* ── Top States (Horizontal) ───────────────────────────────── */}
      <section className="space-y-3" aria-labelledby="top-states-heading">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 id="top-states-heading" className="font-bold text-on-surface text-base uppercase tracking-wider">
              Top States for Investment
            </h2>
            <p className="label-caps opacity-60 mt-0.5">
              Ranked by {energyType === 'wind' ? 'wind speed' : 'solar irradiance'} × electricity price
            </p>
          </div>
          <span className="label-caps opacity-40">Live EIA · NREL</span>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-4 lg:overflow-visible">
          {topInvestStates.map((state, i) => (
            <article
              key={state.abbr}
              className="min-w-[240px] lg:min-w-0 bg-surface-container-low rounded-xl p-5 shadow-botanical"
            >
              <div className="flex items-start justify-between gap-2 mb-4">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-on-surface/30">
                  #{i + 1}
                </span>
                <span className="label-caps text-primary">{opportunityTag(state.resource, energyType)}</span>
              </div>

              <h3 className="text-xl font-extrabold text-on-surface leading-tight">{state.name}</h3>
              <p className="text-xs text-on-surface-variant font-medium mt-0.5">{state.abbr}</p>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <div>
                  <p className="label-caps opacity-60">{energyType === 'wind' ? 'Wind Speed' : 'GHI'}</p>
                  <p className="text-lg font-black text-on-surface tabular-nums">
                    {state.resource.toFixed(1)}
                    <span className="text-xs font-bold text-on-surface/50 ml-0.5">
                      {energyType === 'wind' ? 'm/s' : 'kWh/m²'}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="label-caps opacity-60">Electricity Rate</p>
                  <p className="text-lg font-black text-on-surface tabular-nums">
                    {state.price != null ? `$${state.price.toFixed(3)}` : '—'}
                    <span className="text-xs font-bold text-on-surface/50 ml-0.5">/kWh</span>
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

    </div>
  )
}
