import { useMemo } from 'react'
import { useEiaData } from '../../hooks/useEiaData'
import useDashboardStore from '../../store/dashboardStore'
import MetricCard from '../../components/ui/MetricCard'
import CapacityTrendChart from './CapacityTrendChart'
import { STATE_METADATA } from '../../constants/stateMetadata'

// Region definitions — state abbreviations grouped geographically
const REGIONS = {
  Northeast: ['ME','NH','VT','MA','RI','CT','NY','NJ','PA','MD','DE','DC'],
  Midwest:   ['OH','MI','IN','IL','WI','MN','IA','MO','ND','SD','NE','KS'],
  Southeast: ['VA','WV','NC','SC','GA','FL','AL','MS','TN','KY','AR','LA'],
  Southwest: ['TX','NM','AZ','OK','CO','UT','NV'],
  Pacific:   ['WA','OR','CA','AK','HI','ID','MT','WY'],
}

function ghiLabel(ghi) {
  if (ghi >= 5.5) return 'Exceptional'
  if (ghi >= 5.0) return 'Excellent'
  if (ghi >= 4.5) return 'High'
  if (ghi >= 4.0) return 'Moderate'
  return 'Low'
}

function outlookLabel(avgPrice, avgGhi) {
  if (avgGhi >= 5.0 && avgPrice >= 0.14) return 'Optimal'
  if (avgGhi >= 5.0) return 'High Yield'
  if (avgPrice >= 0.18) return 'Price-Driven'
  if (avgGhi >= 4.5) return 'Growing'
  return 'Developing'
}

export default function MarketOverview() {
  const { data, error, isLoading } = useEiaData()

  const nationalElectricityPrice = useDashboardStore((s) => s.nationalElectricityPrice)
  const totalSolarCapacityGW     = useDashboardStore((s) => s.totalSolarCapacityGW)
  const priceTimeSeries          = useDashboardStore((s) => s.priceTimeSeries)
  const statePrices              = useDashboardStore((s) => s.statePrices)
  const marketLastFetched        = useDashboardStore((s) => s.marketLastFetched)

  // YoY calculations
  const sortedPrices = [...(data?.priceTimeSeries ?? [])].sort((a, b) => b.period.localeCompare(a.period))
  const latestPrice     = sortedPrices[0]?.price
  const priceOneYearAgo = sortedPrices[12]?.price
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

  // GHI lookup from pre-bundled stateMetadata
  const ghiByAbbr = useMemo(() => {
    const map = {}
    STATE_METADATA.forEach((s) => { map[s.abbr] = s.ghi })
    return map
  }, [])

  // Compute regional averages from live EIA statePrices + pre-bundled NREL GHI
  const regionalRows = useMemo(() => {
    return Object.entries(REGIONS).map(([region, abbrs]) => {
      const prices = abbrs.map((a) => statePrices[a]).filter((p) => p != null)
      const ghis   = abbrs.map((a) => ghiByAbbr[a]).filter((g) => g != null)
      const avgPrice = prices.length ? prices.reduce((s, v) => s + v, 0) / prices.length : null
      const avgGhi   = ghis.length   ? ghis.reduce((s, v) => s + v, 0)   / ghis.length   : null
      return { region, avgPrice, avgGhi }
    })
  }, [statePrices, ghiByAbbr])

  const hasRegionalData = regionalRows.some((r) => r.avgPrice != null)

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
          info="Average U.S. retail electricity price across all sectors from EIA; used as a baseline revenue assumption."
          value={nationalElectricityPrice != null ? `$${nationalElectricityPrice.toFixed(3)}` : null}
          unit="/ kWh"
          delta={yoyPriceChangePct}
          deltaLabel="% YoY"
          source="vs prev. year · EIA"
          isLoading={isLoading}
          isError={!!error && !nationalElectricityPrice}
          watermarkIcon="bolt"
        />
        <MetricCard
          label="Installed Solar Capacity"
          info="Total U.S. installed solar net summer capability in GW. Sourced from EIA State Electricity Profiles (Form EIA-860). Updated annually."
          value={totalSolarCapacityGW != null ? totalSolarCapacityGW.toFixed(0) : null}
          unit="GW"
          delta={yoyCapacityAdded}
          deltaLabel="GW added"
          source="vs prev. year · EIA"
          isLoading={isLoading}
          isError={!!error && !totalSolarCapacityGW}
          watermarkIcon="wind_power"
        />
        <MetricCard
          label="Federal ITC Rate"
          info="Investment Tax Credit under the Inflation Reduction Act (IRA) 2022. Applies to solar projects placed in service through 2032. Source: IRS / U.S. Treasury."
          value="30%"
          unit=""
          source="IRA 2022 · through 2032"
          isLoading={false}
          isError={false}
          accentVariant="hero"
          watermarkIcon="policy"
        />
        <MetricCard
          label="Utility Solar LCOE Range"
          info="Levelized Cost of Energy for utility-scale PV in the U.S., representing the range from low-resource to high-resource sites. Source: NREL Annual Technology Baseline 2024."
          value="$0.033–$0.068"
          unit="/ kWh"
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
        <div className="px-6 py-5 flex items-center justify-between border-b border-on-surface/5">
          <div>
            <h2 id="regional-table-heading" className="font-bold text-on-surface text-base">
              Regional Market Context
            </h2>
            <p className="label-caps mt-0.5 opacity-60">
              {hasRegionalData
                ? 'Live EIA state prices · NREL NSRDB irradiance'
                : 'Loading regional data…'}
            </p>
          </div>
          <span className="label-caps">EIA · NREL</span>
        </div>
        <div className="overflow-x-auto scrollbar-botanical" role="region" aria-label="Regional market table">
          <table className="w-full text-left" aria-label="Regional market performance">
            <thead>
              <tr className="bg-surface-container-high">
                {['Region', 'Avg Price ($/kWh)', 'Avg GHI (kWh/m²/day)', 'Solar Resource', 'Outlook'].map((h) => (
                  <th key={h} scope="col" className="px-6 py-4 label-caps">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {regionalRows.map((row, i) => (
                <tr
                  key={row.region}
                  className={i % 2 === 0 ? 'bg-surface' : 'bg-surface-container-low'}
                >
                  <td className="px-6 py-4 font-bold text-sm text-on-surface">{row.region}</td>
                  <td className="px-6 py-4 font-mono text-sm text-on-surface tabular-nums">
                    {row.avgPrice != null ? `$${row.avgPrice.toFixed(3)}` : '—'}
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-on-surface tabular-nums">
                    {row.avgGhi != null ? row.avgGhi.toFixed(2) : '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant font-medium">
                    {row.avgGhi != null ? ghiLabel(row.avgGhi) : '—'}
                  </td>
                  <td className="px-6 py-4">
                    {row.avgPrice != null && row.avgGhi != null ? (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                        {outlookLabel(row.avgPrice, row.avgGhi)}
                      </span>
                    ) : '—'}
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
