import { useState, useCallback, useMemo, useEffect } from 'react'
import Map, { Source, Layer } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import useDashboardStore from '../../store/dashboardStore'
import { FIPS_TO_STATE, ABBR_TO_STATE } from '../../constants/stateMetadata'
import { fetchPVWatts } from '../../lib/nrelClient'
import statesGeoJsonUrl from '../../assets/us-states.geojson?url'
import StatePopup from './StatePopup'
import LegendPanel from './LegendPanel'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

// GHI → color interpolation stops (matches LegendPanel)
const GHI_COLOR_EXPRESSION = [
  'interpolate', ['linear'],
  ['coalesce', ['get', 'ghi'], 3.5],
  3.0, '#f0f9e8',
  3.5, '#ccebc5',
  4.0, '#a8ddb5',
  4.5, '#43a2ca',
  5.0, '#1d6fa4',
  5.5, '#244a3e',
  6.2, '#102002',
]

export default function MapContainer({ onNavigate }) {
  const statePrices            = useDashboardStore((s) => s.statePrices)
  const setSelectedState       = useDashboardStore((s) => s.setSelectedState)
  const applyStateToCalculator = useDashboardStore((s) => s.applyStateToCalculator)

  const [popup, setPopup]             = useState(null)
  const [hoveredFips, setHoveredFips] = useState(null)
  const [isLoadingNrel, setLoadingNrel] = useState(false)
  const [appliedState, setAppliedState] = useState(null)
  const [rawGeoJson, setRawGeoJson]   = useState(null)

  // Fetch GeoJSON from asset URL once
  useEffect(() => {
    fetch(statesGeoJsonUrl)
      .then((r) => r.json())
      .then(setRawGeoJson)
      .catch(console.error)
  }, [])

  // Merge GHI data into GeoJSON features
  const enrichedGeoJson = useMemo(() => {
    if (!rawGeoJson?.features) return null
    return {
      ...rawGeoJson,
      features: rawGeoJson.features.map((f) => {
        // The downloaded GeoJSON uses "id" field as FIPS (e.g. "01")
        const fips = String(f.id ?? f.properties?.STATE ?? f.properties?.STATEFP ?? '').padStart(2, '0')
        const meta = FIPS_TO_STATE[fips]
        return {
          ...f,
          properties: {
            ...f.properties,
            fips,
            abbr: meta?.abbr ?? '',
            name: meta?.name ?? f.properties?.name ?? '',
            ghi:  meta?.ghi  ?? null,
          },
        }
      }),
    }
  }, [rawGeoJson])

  const handleMouseMove = useCallback((e) => {
    const feature = e.features?.[0]
    setHoveredFips(feature?.properties?.fips ?? null)
  }, [])

  const handleMouseLeave = useCallback(() => setHoveredFips(null), [])

  const handleClick = useCallback(async (e) => {
    const feature = e.features?.[0]
    if (!feature) return

    const { fips, abbr, name, ghi } = feature.properties
    const meta = FIPS_TO_STATE[fips] ?? ABBR_TO_STATE[abbr]
    if (!meta) return

    const electricityRate = statePrices[abbr] ?? null

    // Open popup immediately with available data
    setPopup({ ...meta, ghi, electricityRate, capacityFactor: null })
    setSelectedState({ fips, abbr, name, ghi, electricityRate, capacityFactor: null })

    // Fetch live NREL PVWatts capacity factor
    setLoadingNrel(true)
    try {
      const { capacityFactor } = await fetchPVWatts(meta.lat, meta.lon)
      setPopup((prev) => prev ? { ...prev, capacityFactor } : null)
      setSelectedState({ fips, abbr, name, ghi, electricityRate, capacityFactor })
    } catch {
      // silently degrade — popup still shows without capacity factor
    } finally {
      setLoadingNrel(false)
    }
  }, [statePrices, setSelectedState])

  const handleUseInCalculator = useCallback(() => {
    if (!popup) return
    applyStateToCalculator({
      capacityFactor:  popup.capacityFactor,
      electricityRate: popup.electricityRate,
      fips:  popup.fips,
      abbr:  popup.abbr,
    })
    setAppliedState(popup.abbr)
    // Navigate to Calculator tab (index 1)
    onNavigate?.(1)
  }, [popup, applyStateToCalculator, onNavigate])

  // Layer paint properties
  const fillPaint = useMemo(() => ({
    'fill-color': GHI_COLOR_EXPRESSION,
    'fill-opacity': [
      'case',
      ['==', ['get', 'fips'], hoveredFips ?? ''], 0.95,
      0.72,
    ],
  }), [hoveredFips])

  const linePaint = useMemo(() => ({
    'line-color': '#fffcca',
    'line-width': 1,
  }), [])

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden" style={{ minHeight: 480 }}>
      <Map
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{ longitude: -98.5, latitude: 39.5, zoom: 3.5 }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        interactiveLayerIds={['state-fill']}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        style={{ width: '100%', height: '100%' }}
        aria-label="Interactive U.S. solar resource map — click a state for details"
        reuseMaps
      >
        {enrichedGeoJson && <Source id="us-states" type="geojson" data={enrichedGeoJson}>
          <Layer
            id="state-fill"
            type="fill"
            paint={fillPaint}
          />
          <Layer
            id="state-border"
            type="line"
            paint={linePaint}
          />
        </Source>}

        {/* Hover cursor style */}
        {hoveredFips && (
          <style>{`.mapboxgl-canvas-container { cursor: pointer; }`}</style>
        )}

        {/* State popup */}
        {popup && (
          <StatePopup
            state={popup}
            onClose={() => setPopup(null)}
            onUseInCalculator={handleUseInCalculator}
            isLoadingNrel={isLoadingNrel}
          />
        )}
      </Map>

      {/* Legend overlay */}
      <LegendPanel />

      {/* Applied state toast */}
      {appliedState && (
        <div
          className="absolute top-4 right-4 z-10 bg-tertiary-fixed text-on-tertiary-fixed-variant px-4 py-2.5 rounded-xl shadow-botanical text-xs font-extrabold uppercase tracking-widest flex items-center gap-2"
          role="status"
          aria-live="polite"
        >
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
          {appliedState} applied to Calculator
        </div>
      )}
    </div>
  )
}
