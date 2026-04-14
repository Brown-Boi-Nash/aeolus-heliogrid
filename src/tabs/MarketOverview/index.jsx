import { useMemo } from 'react'
import { useEiaData } from '../../hooks/useEiaData'
import { useFredData } from '../../hooks/useFredData'
import useDashboardStore from '../../store/dashboardStore'
import MetricCard from '../../components/ui/MetricCard'
import CapacityTrendChart from './CapacityTrendChart'
import GridParityStatus from './GridParityStatus'
import TopStatesLeaderboard from './TopStatesLeaderboard'
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

function windLabel(speed) {
  if (speed >= 7.5) return 'Exceptional'
  if (speed >= 6.5) return 'Excellent'
  if (speed >= 5.5) return 'Good'
  if (speed >= 4.5) return 'Moderate'
  return 'Low'
}

function solarOutlookLabel(avgPrice, avgGhi) {
  if (avgGhi >= 5.0 && avgPrice >= 0.14) return 'Optimal'
  if (avgGhi >= 5.0) return 'High Yield'
  if (avgPrice >= 0.18) return 'Price-Driven'
  if (avgGhi >= 4.5) return 'Growing'
  return 'Developing'
}

function windOutlookLabel(avgPrice, avgWindSpeed) {
  if (avgWindSpeed >= 7.0 && avgPrice >= 0.14) return 'Optimal'
  if (avgWindSpeed >= 7.0) return 'High Yield'
  if (avgPrice >= 0.18) return 'Price-Driven'
  if (avgWindSpeed >= 6.0) return 'Growing'
  return 'Developing'
}

export default function MarketOverview({ onNavigate, theme = 'light' }) {
  const { data, error, isLoading } = useEiaData()
  useFredData()
  const energyType         = useDashboardStore((s) => s.energyType)
  const treasury10Y        = useDashboardStore((s) => s.treasury10Y)
  const fedFunds           = useDashboardStore((s) => s.fedFunds)
  const breakEvenInflation = useDashboardStore((s) => s.breakEvenInflation)

  const nationalElectricityPrice = useDashboardStore((s) => s.nationalElectricityPrice)
  const totalSolarCapacityGW     = useDashboardStore((s) => s.totalSolarCapacityGW)
  const totalWindCapacityGW      = useDashboardStore((s) => s.totalWindCapacityGW)
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

  const selectedCapacitySeries = energyType === 'wind'
    ? (data?.windCapacityTimeSeries ?? [])
    : (data?.solarCapacityTimeSeries ?? data?.capacityTimeSeries ?? [])

  const sortedCapacity   = [...selectedCapacitySeries].sort((a, b) => b.year.localeCompare(a.year))
  const latestCap        = sortedCapacity[0]?.capacityGW
  const prevCap          = sortedCapacity[1]?.capacityGW
  const yoyCapacityAdded = latestCap && prevCap ? latestCap - prevCap : null

  const lastUpdatedStr = marketLastFetched
    ? new Date(marketLastFetched).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null

  const resourceByAbbr = useMemo(() => {
    const map = {}
    STATE_METADATA.forEach((s) => {
      map[s.abbr] = energyType === 'wind' ? s.windSpeed : s.ghi
    })
    return map
  }, [energyType])

  // Compute regional averages from live EIA statePrices + pre-bundled resource data
  const regionalRows = useMemo(() => {
    return Object.entries(REGIONS).map(([region, abbrs]) => {
      const prices = abbrs.map((a) => statePrices[a]).filter((p) => p != null)
      const resources = abbrs.map((a) => resourceByAbbr[a]).filter((g) => g != null)
      const avgPrice = prices.length ? prices.reduce((s, v) => s + v, 0) / prices.length : null
      const avgResource = resources.length ? resources.reduce((s, v) => s + v, 0) / resources.length : null
      return { region, avgPrice, avgResource }
    })
  }, [statePrices, resourceByAbbr])

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
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-on-surface tracking-tight"
          >
            Market Overview
          </h1>
          <p className="text-on-surface-variant font-medium mt-1">
            U.S. {energyType === 'wind' ? 'Wind' : 'Solar'} Energy Sector Analysis
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
          info={energyType === 'wind'
            ? 'Total U.S. installed wind net summer capability in GW. Sourced from EIA State Electricity Profiles (Form EIA-860). Updated annually.'
            : 'Total U.S. installed solar net summer capability in GW. Sourced from EIA State Electricity Profiles (Form EIA-860). Updated annually.'}
          label={energyType === 'wind' ? 'Installed Wind Capacity' : 'Installed Solar Capacity'}
          value={(energyType === 'wind' ? totalWindCapacityGW : totalSolarCapacityGW) != null
            ? (energyType === 'wind' ? totalWindCapacityGW : totalSolarCapacityGW).toFixed(0)
            : null}
          unit="GW"
          delta={yoyCapacityAdded}
          deltaLabel="GW added"
          source="vs prev. year · EIA"
          isLoading={isLoading}
          isError={!!error && !(energyType === 'wind' ? totalWindCapacityGW : totalSolarCapacityGW)}
          watermarkIcon={energyType === 'wind' ? 'wind_power' : 'solar_power'}
        />
        <MetricCard
          label={energyType === 'wind' ? 'Federal ITC / PTC' : 'Federal ITC Rate'}
          info={energyType === 'wind'
            ? 'Wind projects under IRA 2022 may elect a 30% Investment Tax Credit (ITC) or the Production Tax Credit (PTC) at $0.028/kWh for 10 years. Election depends on project economics. Source: IRS / U.S. Treasury.'
            : 'Investment Tax Credit under the Inflation Reduction Act (IRA) 2022. Applies to solar projects placed in service through 2032. Source: IRS / U.S. Treasury.'}
          value="30%"
          unit=""
          source={energyType === 'wind' ? 'IRA 2022 · ITC or PTC elective' : 'IRA 2022 · through 2032'}
          isLoading={false}
          isError={false}
          accentVariant="hero"
          watermarkIcon="policy"
        />
        <MetricCard
          label={`Utility ${energyType === 'wind' ? 'Wind' : 'Solar'} LCOE Range`}
          info={energyType === 'wind'
            ? 'Levelized Cost of Energy benchmark for utility-scale onshore wind in the U.S. Source: NREL Annual Technology Baseline 2024.'
            : 'Levelized Cost of Energy for utility-scale PV in the U.S., representing the range from low-resource to high-resource sites. Source: NREL Annual Technology Baseline 2024.'}
          value={energyType === 'wind' ? '$0.033–$0.054' : '$0.033–$0.068'}
          unit="/ kWh"
          source="NREL ATB 2024"
          isLoading={false}
          isError={false}
          watermarkIcon={energyType === 'wind' ? 'wind_power' : 'solar_power'}
        />
      </section>

      {/* ── Macro Context Strip ───────────────────────────────────── */}
      {(treasury10Y != null || fedFunds != null || breakEvenInflation != null) && (
        <section
          className="bg-surface-container-low rounded-xl px-5 py-3 flex flex-wrap items-center gap-x-6 gap-y-2"
          aria-label="Live macroeconomic benchmarks"
        >
          <span className="label-caps opacity-50 mr-2">Live Macro · FRED</span>
          {treasury10Y != null && (
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-on-surface-variant"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>account_balance</span>
              <span className="text-xs font-bold text-on-surface">10Y Treasury</span>
              <span className="text-xs font-extrabold text-primary tabular-nums">{treasury10Y.toFixed(2)}%</span>
            </div>
          )}
          {fedFunds != null && (
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-on-surface-variant"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>percent</span>
              <span className="text-xs font-bold text-on-surface">Fed Funds</span>
              <span className="text-xs font-extrabold text-primary tabular-nums">{fedFunds.toFixed(2)}%</span>
            </div>
          )}
          {breakEvenInflation != null && (
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-on-surface-variant"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>trending_up</span>
              <span className="text-xs font-bold text-on-surface">10Y Breakeven Inflation</span>
              <span className="text-xs font-extrabold text-primary tabular-nums">{breakEvenInflation.toFixed(2)}%</span>
            </div>
          )}
        </section>
      )}

      {/* ── Top States Leaderboard ────────────────────────────────── */}
      <TopStatesLeaderboard
        statePrices={statePrices}
        nationalPrice={nationalElectricityPrice}
        onNavigate={onNavigate}
      />

      {/* ── Charts ────────────────────────────────────────────────── */}
      <CapacityTrendChart
        priceData={isLoading ? [] : priceTimeSeries}
        capacityData={isLoading ? [] : selectedCapacitySeries}
        energyType={energyType}
        theme={theme}
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
                ? `Live EIA state prices · ${energyType === 'wind' ? 'pre-bundled wind speed dataset' : 'NREL NSRDB irradiance'}`
                : 'Loading regional data…'}
            </p>
          </div>
          <span className="label-caps">EIA · NREL</span>
        </div>
        <div className="overflow-x-auto scrollbar-botanical" role="region" aria-label="Regional market table">
          <table className="w-full text-left" aria-label="Regional market performance">
            <thead>
              <tr className="bg-surface-container-high">
                {[
                  'Region',
                  'Avg Price ($/kWh)',
                  energyType === 'wind' ? 'Avg Wind Speed (m/s)' : 'Avg GHI (kWh/m²/day)',
                  energyType === 'wind' ? 'Wind Resource' : 'Solar Resource',
                  'Outlook',
                ].map((h) => (
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
                    {row.avgResource != null ? row.avgResource.toFixed(2) : '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant font-medium">
                    {row.avgResource != null
                      ? (energyType === 'wind' ? windLabel(row.avgResource) : ghiLabel(row.avgResource))
                      : '—'}
                  </td>
                  <td className="px-6 py-4">
                    {row.avgPrice != null && row.avgResource != null ? (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                        {energyType === 'wind'
                          ? windOutlookLabel(row.avgPrice, row.avgResource)
                          : solarOutlookLabel(row.avgPrice, row.avgResource)}
                      </span>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Grid Parity Status ────────────────────────────────────── */}
      <GridParityStatus
        energyType={energyType}
        nationalPrice={nationalElectricityPrice}
        regionalRows={regionalRows}
      />

    </div>
  )
}
