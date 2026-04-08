import { useEiaData } from '../../hooks/useEiaData'
import useDashboardStore from '../../store/dashboardStore'
import MetricCard from '../../components/ui/MetricCard'
import CapacityTrendChart from './CapacityTrendChart'

export default function MarketOverview() {
  const { data, error, isLoading } = useEiaData()

  const nationalElectricityPrice = useDashboardStore((s) => s.nationalElectricityPrice)
  const totalSolarCapacityGW     = useDashboardStore((s) => s.totalSolarCapacityGW)
  const priceTimeSeries          = useDashboardStore((s) => s.priceTimeSeries)
  const marketLastFetched        = useDashboardStore((s) => s.marketLastFetched)

  // YoY calculations
  const sortedPrices = [...(data?.priceTimeSeries ?? [])].sort((a, b) => b.period.localeCompare(a.period))
  const latestPrice      = sortedPrices[0]?.price
  const priceOneYearAgo  = sortedPrices[12]?.price
  const yoyPriceChangePct = latestPrice && priceOneYearAgo
    ? ((latestPrice - priceOneYearAgo) / priceOneYearAgo) * 100
    : null

  const sortedCapacity   = [...(data?.capacityTimeSeries ?? [])].sort((a, b) => b.year.localeCompare(a.year))
  const latestCap        = sortedCapacity[0]?.capacityGW
  const prevCap          = sortedCapacity[1]?.capacityGW
  const yoyCapacityAdded = latestCap && prevCap ? latestCap - prevCap : null

  const lastUpdatedStr = marketLastFetched
    ? new Date(marketLastFetched).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <div className="space-y-8 animate-fade-in">

      {/* ── Section Header ────────────────────────────────────────── */}
      <section
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        aria-labelledby="market-overview-heading"
      >
        <div>
          <h1
            id="market-overview-heading"
            className="text-4xl font-extrabold text-on-surface tracking-tight"
          >
            Market Overview
          </h1>
          <p className="text-on-surface-variant font-medium mt-1">
            U.S. Renewable Energy Sector Analysis
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdatedStr && (
            <div
              className="bg-surface-container-low px-4 py-2 rounded-xl flex items-center gap-2"
              aria-label={`Data last updated at ${lastUpdatedStr}`}
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse-soft" aria-hidden="true" />
              <span className="label-caps text-on-surface">Live Market Data</span>
              <span className="text-[10px] text-on-surface/40 font-bold">{lastUpdatedStr}</span>
            </div>
          )}
        </div>
      </section>

      {/* ── Error Banner ──────────────────────────────────────────── */}
      {error && (
        <div
          role="alert"
          className="bg-error-container text-on-error-container rounded-xl px-5 py-3 text-sm font-medium"
        >
          <strong>EIA data unavailable.</strong> Displaying cached values where available.
        </div>
      )}

      {/* ── KPI Bento Grid ────────────────────────────────────────── */}
      <section
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        aria-label="Key market metrics"
      >
        <MetricCard
          label="National Avg. Electricity Price"
          value={nationalElectricityPrice != null ? `$${nationalElectricityPrice.toFixed(3)}` : null}
          unit="/ kWh"
          delta={yoyPriceChangePct}
          deltaLabel="% YoY"
          source="vs prev. year"
          isLoading={isLoading}
          isError={!!error && !nationalElectricityPrice}
          watermarkIcon="bolt"
        />
        <MetricCard
          label="Installed Solar Capacity"
          value={totalSolarCapacityGW != null ? totalSolarCapacityGW.toFixed(0) : null}
          unit="GW"
          delta={yoyCapacityAdded}
          deltaLabel="GW added"
          source="vs prev. year"
          isLoading={isLoading}
          isError={!!error && !totalSolarCapacityGW}
          watermarkIcon="wind_power"
        />
        {/* Hero card — botanical gradient */}
        <MetricCard
          label="Federal ITC Rate"
          value="30%"
          unit=""
          delta={null}
          source="IRA 2022 · through 2032"
          isLoading={false}
          isError={false}
          accentVariant="hero"
          watermarkIcon="policy"
        />
        <MetricCard
          label="Utility Solar LCOE Range"
          value="$0.033–$0.068"
          unit="/ kWh"
          delta={null}
          source="NREL ATB 2024"
          isLoading={false}
          isError={false}
          watermarkIcon="solar_power"
        />
      </section>

      {/* ── Charts ────────────────────────────────────────────────── */}
      <CapacityTrendChart
        priceData={isLoading ? [] : priceTimeSeries}
        capacityData={isLoading ? [] : (data?.capacityTimeSeries ?? [])}
      />

      {/* ── Regional Table ────────────────────────────────────────── */}
      <section
        className="bg-surface-container-low rounded-xl overflow-hidden"
        aria-labelledby="regional-table-heading"
      >
        <div className="px-6 py-5 flex items-center justify-between border-b ghost-border border-on-surface/5">
          <h2 id="regional-table-heading" className="font-bold text-on-surface text-base">
            Regional Market Context
          </h2>
          <span className="label-caps">EIA · Latest Annual</span>
        </div>
        <div className="overflow-x-auto scrollbar-botanical" role="region" aria-label="Regional market table, scroll horizontally to see all columns">
          <table className="w-full text-left" aria-label="Regional market performance">
            <thead>
              <tr className="bg-surface-container-high">
                {['Region', 'Avg Price ($/kWh)', 'Solar Resource', 'YoY Change', 'Outlook'].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="px-6 py-4 label-caps"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { region: 'Northeast', price: '0.224', resource: 'Moderate', yoy: '+3.2', positive: true, outlook: 'Developing' },
                { region: 'Midwest',   price: '0.142', resource: 'High',     yoy: '+14.5', positive: true, outlook: 'High Yield' },
                { region: 'Southwest', price: '0.185', resource: 'Excellent', yoy: '+8.7', positive: true, outlook: 'Optimal' },
                { region: 'Southeast', price: '0.131', resource: 'Good',     yoy: '+6.1', positive: true, outlook: 'Growing' },
                { region: 'Pacific',   price: '0.248', resource: 'Good',     yoy: '-1.4', positive: false, outlook: 'Limited' },
              ].map((row, i) => (
                <tr
                  key={row.region}
                  className={i % 2 === 0 ? 'bg-surface' : 'bg-surface-container-low'}
                >
                  <td className="px-6 py-4 font-bold text-sm text-on-surface">{row.region}</td>
                  <td className="px-6 py-4 font-mono text-sm text-on-surface tabular-nums">{row.price}</td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant font-medium">{row.resource}</td>
                  <td className="px-6 py-4">
                    <span className={row.positive ? 'chip-positive' : 'chip-negative'}>
                      <span className="material-symbols-outlined text-xs" aria-hidden="true"
                        style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}>
                        {row.positive ? 'trending_up' : 'trending_down'}
                      </span>
                      {row.yoy}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      {row.outlook}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Strategic Insight ─────────────────────────────────────── */}
      <section
        className="bg-surface-container-highest rounded-xl p-6 border-l-4 border-primary"
        aria-labelledby="insight-heading"
      >
        <span className="label-caps text-primary block mb-1">Strategic Insight</span>
        <h2 id="insight-heading" className="text-xl font-extrabold text-on-surface mb-3">
          The Rise of Battery Storage Co-location
        </h2>
        <p className="text-sm leading-relaxed text-on-surface-variant max-w-3xl">
          2024 marks a record year for utility-scale battery storage integration, growing by 45%. This shift
          is stabilizing peak-hour pricing in historically volatile regions like Texas and California, creating
          new arbitrage opportunities for renewable asset owners. Projects co-locating solar + storage now
          command a 15–20% premium in PPA negotiations.
        </p>
        <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-primary/50">
          Sources: BloombergNEF H2 2024 · Wood Mackenzie Solar Market Insight
        </p>
      </section>

    </div>
  )
}
