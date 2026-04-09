import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts'

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div
      className="bg-surface-container-lowest rounded-xl shadow-botanical px-4 py-3 text-sm"
      role="tooltip"
    >
      <p className="label-caps mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="font-extrabold text-primary tabular-nums">
          {p.value != null ? p.value.toFixed(3) : '—'} {p.unit}
        </p>
      ))}
    </div>
  )
}

export default function CapacityTrendChart({ priceData, capacityData, energyType = 'solar' }) {
  return (
    <section
      className="grid grid-cols-1 xl:grid-cols-2 gap-6"
      aria-label="Market trend charts"
    >
      {/* Electricity Price Trend */}
      <div className="bg-surface-container-low rounded-xl p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-on-surface text-base">Electricity Price Trends</h3>
            <p className="label-caps mt-0.5">U.S. national average · all sectors</p>
          </div>
          <span className="chip-positive bg-surface-container text-on-surface-variant">
            EIA Monthly
          </span>
        </div>

        {priceData.length === 0 ? (
          <div className="h-52 bg-surface-container rounded-lg animate-pulse" aria-busy="true" aria-label="Loading chart" />
        ) : (
          <ResponsiveContainer width="100%" height={208}>
            <LineChart data={priceData} margin={{ top: 4, right: 4, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f0ba" vertical={false} />
              <XAxis
                dataKey="period"
                tick={{ fontSize: 10, fill: '#717975', fontFamily: 'Manrope', fontWeight: 700 }}
                tickFormatter={(v) => v?.slice(0, 7)}
                interval="preserveStartEnd"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#717975', fontFamily: 'Manrope', fontWeight: 700 }}
                tickFormatter={(v) => `$${v.toFixed(2)}`}
                width={52}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="price"
                name="Price"
                unit="$/kWh"
                stroke="#244a3e"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: '#244a3e', stroke: '#fffcca', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
        <p className="text-[10px] font-bold text-on-surface/30 uppercase tracking-widest">
          Source: EIA Electric Power Monthly
        </p>
      </div>

      {/* Technology Capacity Growth */}
      <div className="bg-surface-container-low rounded-xl p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-on-surface text-base">
              U.S. {energyType === 'wind' ? 'Wind' : 'Solar'} Capacity Growth
            </h3>
            <p className="label-caps mt-0.5">Utility-scale installed · annual GW</p>
          </div>
          <span className="chip-positive bg-surface-container text-on-surface-variant">
            EIA Annual
          </span>
        </div>

        {capacityData.length === 0 ? (
          <div className="h-52 bg-surface-container rounded-lg animate-pulse" aria-busy="true" aria-label="Loading chart" />
        ) : (
          <ResponsiveContainer width="100%" height={208}>
            <BarChart data={capacityData} margin={{ top: 4, right: 4, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f0ba" vertical={false} />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 10, fill: '#717975', fontFamily: 'Manrope', fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#717975', fontFamily: 'Manrope', fontWeight: 700 }}
                tickFormatter={(v) => `${v.toFixed(0)} GW`}
                width={60}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar
                dataKey="capacityGW"
                name="Capacity"
                unit=" GW"
                fill="#244a3e"
                radius={[2, 2, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
        <p className="text-[10px] font-bold text-on-surface/30 uppercase tracking-widest">
          Source: EIA State Electricity Profiles (Table 4)
        </p>
      </div>
    </section>
  )
}
