import { useMemo } from 'react'
import MapContainer from './MapContainer'
import StatePolicyPanel from './StatePolicyPanel'
import { useEiaData } from '../../hooks/useEiaData'
import useDashboardStore from '../../store/dashboardStore'
import { STATE_METADATA } from '../../constants/stateMetadata'

export default function GeographicMap({ onNavigate, theme = 'light' }) {
  useEiaData()
  const energyType    = useDashboardStore((s) => s.energyType)
  const selectedState = useDashboardStore((s) => s.selectedState)

  const DEFAULT_STATE = useMemo(
    () => STATE_METADATA.find((s) => s.abbr === 'AL'),
    []
  )
  const policyAbbr = selectedState?.abbr ?? DEFAULT_STATE.abbr
  const policyName = selectedState?.name ?? DEFAULT_STATE.name

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
        <MapContainer onNavigate={onNavigate} energyType={energyType} theme={theme} />
      </div>

      {/* ── State Policy Panel ───────────────────────────────────── */}
      <StatePolicyPanel abbr={policyAbbr} name={policyName} />


    </div>
  )
}
