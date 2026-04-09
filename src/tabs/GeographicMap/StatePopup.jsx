import { Popup } from 'react-map-gl'

export default function StatePopup({ state, energyType = 'solar', onClose, onUseInCalculator, isLoadingNrel }) {
  if (!state) return null

  const { name, ghi, windSpeed, electricityRate, capacityFactor, lat, lon } = state

  return (
    <Popup
      latitude={lat}
      longitude={lon}
      onClose={onClose}
      closeButton={true}
      closeOnClick={false}
      anchor="bottom"
      offset={12}
      style={{ fontFamily: 'Manrope, sans-serif' }}
    >
      <div
        className="bg-surface-container-lowest rounded-xl p-4 min-w-[220px]"
        role="dialog"
        aria-label={`${name} ${energyType} data`}
      >
        {/* Header */}
        <div className="mb-3">
          <p className="label-caps text-primary mb-0.5">
            State {energyType === 'wind' ? 'Wind' : 'Solar'} Profile
          </p>
          <h3 className="text-lg font-extrabold text-on-surface">{name}</h3>
        </div>

        {/* Metrics */}
        <div className="space-y-2.5">
          <DataRow
            label={energyType === 'wind' ? 'Wind Speed (100m)' : 'Solar Resource (GHI)'}
            value={energyType === 'wind'
              ? windSpeed != null ? `${windSpeed.toFixed(2)} m/s` : '—'
              : ghi != null ? `${ghi.toFixed(2)} kWh/m²/day` : '—'}
            highlight={energyType === 'wind' ? windSpeed >= 6.5 : ghi >= 5.0}
          />
          <DataRow
            label="Retail Electricity Rate"
            value={electricityRate != null ? `$${electricityRate.toFixed(3)}/kWh` : '—'}
          />
          <DataRow
            label="Est. Capacity Factor"
            value={
              isLoadingNrel
                ? 'Loading…'
                : capacityFactor != null
                  ? `${(capacityFactor * 100).toFixed(1)}%`
                  : '—'
            }
            highlight={energyType === 'wind' ? capacityFactor >= 0.30 : capacityFactor >= 0.22}
          />
        </div>

        {/* CTA */}
        <button
          onClick={onUseInCalculator}
          disabled={isLoadingNrel}
          className="mt-4 w-full py-2.5 bg-primary text-on-primary rounded-xl text-xs font-extrabold uppercase tracking-widest hover:bg-primary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label={`Apply ${name} data to Project Economics calculator`}
        >
          {isLoadingNrel ? 'Fetching NREL data…' : 'Use in Calculator →'}
        </button>
      </div>
    </Popup>
  )
}

function DataRow({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
        {label}
      </span>
      <span className={`text-sm font-extrabold tabular-nums ${highlight ? 'text-primary' : 'text-on-surface'}`}>
        {value}
      </span>
    </div>
  )
}
