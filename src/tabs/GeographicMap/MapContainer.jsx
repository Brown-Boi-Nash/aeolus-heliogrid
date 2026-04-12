import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
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
  3.0, '#c8e6b0',
  3.5, '#a8ddb5',
  4.0, '#6cbf8e',
  4.5, '#43a2ca',
  5.0, '#1d6fa4',
  5.5, '#244a3e',
  6.2, '#102002',
]

const WIND_COLOR_EXPRESSION = [
  'interpolate', ['linear'],
  ['coalesce', ['get', 'windSpeed'], 4.5],
  4.5, '#c8e6b0',
  5.5, '#a8ddb5',
  6.0, '#6cbf8e',
  6.5, '#43a2ca',
  7.0, '#1d6fa4',
  7.5, '#244a3e',
  8.2, '#102002',
]

export default function MapContainer({ onNavigate, energyType = 'solar', theme = 'light' }) {
  const statePrices            = useDashboardStore((s) => s.statePrices)
  const setSelectedState       = useDashboardStore((s) => s.setSelectedState)
  const applyStateToCalculator = useDashboardStore((s) => s.applyStateToCalculator)

  const [popup, setPopup]             = useState(null)
  const [hoveredFips, setHoveredFips] = useState(null)
  const [isLoadingNrel, setLoadingNrel] = useState(false)
  const [appliedState, setAppliedState] = useState(null)
  const [rawGeoJson, setRawGeoJson]   = useState(null)
  const mapRef = useRef(null)
  const styleAdjustedRef = useRef(false)

  const removeLabelHalo = useCallback(() => {
    if (styleAdjustedRef.current) return
    const map = mapRef.current?.getMap?.()
    if (!map || !map.isStyleLoaded()) return

    const style = map.getStyle()
    const layers = style?.layers ?? []
    for (const layer of layers) {
      if (layer.type !== 'symbol') continue
      try { map.setPaintProperty(layer.id, 'text-halo-width', 0) } catch {}
      try { map.setPaintProperty(layer.id, 'text-halo-color', 'rgba(0,0,0,0)') } catch {}
      if (typeof layer.id === 'string' && layer.id.includes('state-label')) {
        try {
          map.setPaintProperty(layer.id, 'text-color', theme === 'dark' ? '#e6e3b0' : '#2b3430')
        } catch {}
      }
    }
    styleAdjustedRef.current = true
  }, [theme])

  useEffect(() => {
    styleAdjustedRef.current = false
  }, [theme])

  // Fetch GeoJSON from asset URL once
  useEffect(() => {
    fetch(statesGeoJsonUrl)
      .then((r) => r.json())
      .then(setRawGeoJson)
      .catch(console.error)
  }, [])

  // Merge resource data into GeoJSON features
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
            windSpeed: meta?.windSpeed ?? null,
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

    const { fips, abbr, name, ghi, windSpeed } = feature.properties
    const meta = FIPS_TO_STATE[fips] ?? ABBR_TO_STATE[abbr]
    if (!meta) return

    const electricityRate = statePrices[abbr] ?? null
    const staticCapacityFactor = energyType === 'wind' ? meta.windCF : null

    // Compute popup anchor direction so it always opens toward available space,
    // preventing clipping by the map container's overflow-hidden boundary.
    let anchor = 'bottom'
    const map = mapRef.current?.getMap?.()
    if (map) {
      const canvas = map.getCanvas()
      const pt     = map.project([meta.lon, meta.lat])
      const relX   = pt.x / canvas.clientWidth
      const relY   = pt.y / canvas.clientHeight
      if (relY < 0.45)        anchor = 'top'
      else if (relX < 0.25)   anchor = 'bottom-right'
      else if (relX > 0.75)   anchor = 'bottom-left'
      else                    anchor = 'bottom'
    }

    // Open popup immediately with available data
    setPopup({
      ...meta,
      ghi,
      windSpeed,
      electricityRate,
      capacityFactor: staticCapacityFactor,
      anchor,
    })
    setSelectedState({
      fips,
      abbr,
      name,
      ghi,
      windSpeed,
      electricityRate,
      capacityFactor: staticCapacityFactor,
    })

    if (energyType === 'wind') {
      setLoadingNrel(false)
      return
    }

    // Fetch live NREL PVWatts capacity factor
    setLoadingNrel(true)
    try {
      const { capacityFactor } = await fetchPVWatts(meta.lat, meta.lon)
      setPopup((prev) => prev ? { ...prev, capacityFactor } : null)  // preserve anchor
      setSelectedState({ fips, abbr, name, ghi, windSpeed, electricityRate, capacityFactor })
    } catch {
      // silently degrade — popup still shows without capacity factor
    } finally {
      setLoadingNrel(false)
    }
  }, [statePrices, setSelectedState, energyType])

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
    'fill-color': energyType === 'wind' ? WIND_COLOR_EXPRESSION : GHI_COLOR_EXPRESSION,
    'fill-opacity': [
      'case',
      ['==', ['get', 'fips'], hoveredFips ?? ''], 1.0,
      0.88,
    ],
  }), [hoveredFips, energyType])

  const linePaint = useMemo(() => ({
    'line-color': theme === 'dark' ? '#1d1f08' : '#ffffff',
    'line-width': 1,
  }), [theme])

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden" style={{ minHeight: 480 }}>
      <Map
        key={theme}
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{ longitude: -98.5, latitude: 39.5, zoom: 3.5 }}
        mapStyle={theme === 'dark' ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11'}
        onLoad={removeLabelHalo}
        interactiveLayerIds={['state-fill']}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        style={{ width: '100%', height: '100%' }}
        aria-label={`Interactive U.S. ${energyType === 'wind' ? 'wind resource' : 'solar resource'} map — click a state for details`}
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
            anchor={popup.anchor ?? 'bottom'}
            energyType={energyType}
            onClose={() => setPopup(null)}
            onUseInCalculator={handleUseInCalculator}
            isLoadingNrel={energyType === 'solar' && isLoadingNrel}
          />
        )}
      </Map>

      {/* Legend overlay */}
      <LegendPanel energyType={energyType} />

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
