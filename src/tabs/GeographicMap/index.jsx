import { Suspense } from 'react'
import MapContainer from './MapContainer'
import { useEiaData } from '../../hooks/useEiaData'

export default function GeographicMap({ onNavigate }) {
  // Ensure EIA state prices are loaded (shared hook — deduped by SWR)
  useEiaData()

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
            U.S. solar irradiance by state · Click a state to analyze
          </p>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-on-surface/40">
          <span>Source: NREL NSRDB · EIA State Prices</span>
        </div>
      </section>

      {/* ── Map ───────────────────────────────────────────────────── */}
      <div
        className="rounded-xl overflow-hidden shadow-botanical"
        style={{ height: 520 }}
      >
        <MapContainer onNavigate={onNavigate} />
      </div>

      {/* ── How to Use ────────────────────────────────────────────── */}
      <section
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        aria-label="Map instructions"
      >
        {[
          {
            icon: 'touch_app',
            title: 'Click a State',
            body: 'Select any U.S. state to see its solar irradiance (GHI), current retail electricity rate from EIA, and an estimated capacity factor from NREL PVWatts.',
          },
          {
            icon: 'calculate',
            title: 'Apply to Calculator',
            body: 'Hit "Use in Calculator" in the popup to auto-fill capacity factor and electricity rate in the Project Economics tab — cross-tab data flow.',
          },
          {
            icon: 'palette',
            title: 'Read the Choropleth',
            body: 'Color intensity maps Global Horizontal Irradiance (GHI). Darker green = stronger solar resource. Southwest states consistently lead the U.S.',
          },
        ].map((item) => (
          <div
            key={item.title}
            className="bg-surface-container-low rounded-xl p-5 flex gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-botanical-gradient flex items-center justify-center flex-shrink-0">
              <span
                className="material-symbols-outlined text-white text-lg"
                aria-hidden="true"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {item.icon}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-on-surface text-sm mb-1">{item.title}</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">{item.body}</p>
            </div>
          </div>
        ))}
      </section>

    </div>
  )
}
