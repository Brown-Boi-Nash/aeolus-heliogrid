// GHI irradiance color legend — positioned over the map
export default function LegendPanel({ energyType = 'solar' }) {
  const stops = energyType === 'wind'
    ? [
      { value: '< 5.5', color: '#c8e6b0' },
      { value: '5.5',   color: '#a8ddb5' },
      { value: '6.0',   color: '#6cbf8e' },
      { value: '6.5',   color: '#43a2ca' },
      { value: '7.0',   color: '#1d6fa4' },
      { value: '7.5',   color: '#244a3e' },
      { value: '> 8.0', color: '#102002' },
    ]
    : [
      { value: '< 3.5', color: '#c8e6b0' },
      { value: '3.5',   color: '#a8ddb5' },
      { value: '4.0',   color: '#6cbf8e' },
      { value: '4.5',   color: '#43a2ca' },
      { value: '5.0',   color: '#1d6fa4' },
      { value: '5.5',   color: '#244a3e' },
      { value: '> 6.0', color: '#102002' },
    ]

  return (
    <div
      className="absolute bottom-8 left-4 z-10 bg-surface-container-lowest/90 backdrop-blur-sm rounded-xl p-4 shadow-botanical"
      role="img"
      aria-label={energyType === 'wind'
        ? 'Wind speed legend: colors range from light green (low) to dark green (high wind speed)'
        : 'Solar irradiance legend: colors range from light green (low) to dark green (high GHI)'}
    >
      <p className="label-caps mb-3">
        {energyType === 'wind' ? 'Wind Resource (100m)' : 'Solar Resource (GHI)'}
      </p>
      <div className="flex flex-col gap-1.5" aria-hidden="true">
        {stops.map((s) => (
          <div key={s.value} className="flex items-center gap-2.5">
            <span
              className="w-4 h-4 rounded-sm flex-shrink-0"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-[10px] font-bold text-on-surface-variant tabular-nums">
              {s.value} {energyType === 'wind' ? 'm/s' : 'kWh/m²/day'}
            </span>
          </div>
        ))}
      </div>
      <p className="text-[9px] font-bold text-on-surface/30 uppercase tracking-widest mt-3">
        Source: {energyType === 'wind' ? 'Pre-bundled Wind Toolkit averages' : 'NREL NSRDB'}
      </p>
    </div>
  )
}
