// GHI irradiance color legend — positioned over the map
export default function LegendPanel() {
  const stops = [
    { ghi: '< 3.5', color: '#f0f9e8' },
    { ghi: '4.0',   color: '#a8ddb5' },
    { ghi: '4.5',   color: '#43a2ca' },
    { ghi: '5.0',   color: '#1d6fa4' },
    { ghi: '5.5',   color: '#244a3e' },
    { ghi: '> 6.0', color: '#102002' },
  ]

  return (
    <div
      className="absolute bottom-8 left-4 z-10 bg-surface-container-lowest/90 backdrop-blur-sm rounded-xl p-4 shadow-botanical"
      role="img"
      aria-label="Solar irradiance legend: colors range from light green (low) to dark green (high GHI)"
    >
      <p className="label-caps mb-3">Solar Resource (GHI)</p>
      <div className="flex flex-col gap-1.5" aria-hidden="true">
        {stops.map((s) => (
          <div key={s.ghi} className="flex items-center gap-2.5">
            <span
              className="w-4 h-4 rounded-sm flex-shrink-0"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-[10px] font-bold text-on-surface-variant tabular-nums">
              {s.ghi} kWh/m²/day
            </span>
          </div>
        ))}
      </div>
      <p className="text-[9px] font-bold text-on-surface/30 uppercase tracking-widest mt-3">
        Source: NREL NSRDB
      </p>
    </div>
  )
}
